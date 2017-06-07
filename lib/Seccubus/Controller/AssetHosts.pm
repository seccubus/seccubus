# ------------------------------------------------------------------------------
# Copyright 2017 Frank Breedijk
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
package Seccubus::Controller::AssetHosts;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use Seccubus::Assets;
use Data::Dumper;

# Create
sub create {
    my $self = shift;

    my $workspace_id = $self->param('workspace_id');
    my $asset_id = $self->param('asset_id');
    my $host = $self->req->json();

    my $error = check_param("workspace", $workspace_id, 1);
    $error = check_param("asset_id", $asset_id, 1) unless $error;
    $error = "No valid host object provided" unless $error || $host;
    $error = "Host needs to have and ip or host" unless $error || ( $host->{ip} || $host->{host} );

    if ( $error ) {
        $self->error($error);
        return;
    }

    my $assets = get_assets($workspace_id);
    my $found = 0;
    if ( @$assets ) {
        foreach my $a ( @$assets ) {
            if ( defined $$a[0] && $$a[0] == $asset_id ) {
                $found = 1;
                last;
            }
        }
    }

    if ( ! $found ) {
        $self->error("Asset $asset_id does not exist in this workspace");
        return;
    }
    eval {
        my $new->{id} = create_asset_host($workspace_id,$asset_id,$host->{ip},$host->{host});
        my $hosts = get_asset_hosts($workspace_id,$asset_id);
        foreach my $h ( @$hosts ) {
            if ( $$h[0] == $new->{id} ) {
                $new->{ip} = $$h[1];
                $new->{host} = $$h[2];
                last;
            }
        }
        if ( $new->{ip} || $new->{host} ) {
            $self->render( json=> $new );
        } else {
            $self->error("Database insert failed");
        }
    } or do {
        $self->error(join "\n", $@);
    };
}

# Read
#sub read {
#    my $self = shift;
#
#}

# List
sub list {
    my $self = shift;

    my $workspace_id = $self->param('workspace_id');
    my $asset_id = $self->param('asset_id');

    my $error = check_param("workspace", $workspace_id, 1);
    $error = check_param("asset_id", $asset_id, 1) unless $error;

    if ( $error ) {
        $self->error($error);
        return;
    }

    eval {
        my @data = map {
            {
                id=>$_->[0],
                ip=>$_->[1],
                host=>$_->[2]
            }
        } @{get_asset_hosts($workspace_id,$asset_id)};

        $self->render( json => \@data );
    } or do {
        $self->error(join "\n", $@);
    };
}

sub update {
    my $self = shift;

    my $assethost = $self->req->json();
    my $workspace_id = $self->param('workspace_id');
    my $asset_id = $self->param('asset_id');
    my $id = $self->param('id');

    my $error = check_param("workspace", $workspace_id, 1);
    $error = check_param("asset_id", $asset_id, 1) unless $error;
    $error = check_param("id", $id, 1) unless $error;
    $error = "No valid host object provided" unless $error || $assethost;
    $error = "Host needs to have and ip or host" unless $error || ( $assethost->{ip} || $assethost->{host} );

    if ( $error ) {
        $self->error($error);
        return;
    }

    eval {
        my $found = 0;
        my $hosts = get_asset_hosts($workspace_id,$asset_id);
        foreach my $h ( @$hosts ) {
            if ( $$h[0] == $id ) {
                $found = 1;
                last;
            }
        }
        if ( ! $found ) {
            die "No assethost $id in asset $asset_id in workspace $workspace_id";
        }

        my $rows = update_asset_host($id,$assethost->{ip},$assethost->{host});
        if ( $rows ) {
            my $new = {
                id          => $id
            };
            my $hosts = get_asset_hosts($workspace_id,$asset_id);
            foreach my $h ( @$hosts ) {
                if ( $$h[0] == $new->{id} ) {
                    $new->{ip} = $$h[1];
                    $new->{host} = $$h[2];
                    last;
                }
            }
            $self->render( json=> $new );
       } else {
            $self->error("No rows updated");
        }
    } or do {
        $self->error(join "\n", $@);
    };
}

sub delete {
    my $self = shift;

    my $workspace_id = $self->param('workspace_id');
    my $asset_id = $self->param('asset_id');
    my $id = $self->param('id');

    my $error = check_param("workspace", $workspace_id, 1);
    $error = check_param("asset_id", $asset_id, 1) unless $error;
    $error = check_param("id", $id, 1) unless $error;

    if ( $error ) {
        $self->error($error);
        return;
    }

    eval {
        my $found = 0;
        my $hosts = get_asset_hosts($workspace_id,$asset_id);
        foreach my $h ( @$hosts ) {
            if ( $$h[0] == $id ) {
                $found = 1;
                last;
            }
        }
        if ( ! $found && $workspace_id != -999 && $asset_id != -999 ) {
            # -999 is a horrible hack, because JMVC doesn't allow more parameters in a destroy
            die "No assethost $id in asset $asset_id in workspace $workspace_id";
        }

        my $sth = delete_asset_host($id);

        if ( $sth->rows() == 1 ) {
            $self->render( json => { id => $id });
        } else {
            $self->error("Unable to delete asset");
        }
    } or do {
        $self->error(join "\n", $@);
    };
}

1;
