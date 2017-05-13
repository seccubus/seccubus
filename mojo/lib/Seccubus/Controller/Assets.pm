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
package Seccubus::Controller::Assets;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use SeccubusAssets;
use Data::Dumper;

# Create
sub create {
    my $self = shift;

    my $asset = $self->req->json();
    my $workspace_id = $self->param('workspace_id');

    if ( ! $asset ) {
            $self->error("No valid json body found"); return;
    }

    #die Dumper $notification;

    my $error = "";
    $error = check_param("workspace", $workspace_id, 1);
    $error = check_param("name", $asset->{name}, 0) unless $error;
    if ( $error ) {
        $self->error($error);
        return;
    }

    eval {
        my $newid = create_asset($workspace_id,$asset->{name},$asset->{hosts},$asset->{recipients});
        my $new = {
            id          => $newid,
            name        => $asset->{name},
            hosts       => $asset->{hosts},
            recipients  => $asset->{recipients},
        };

        $self->render( json=> $new );
    } or do {
        $self->error(join "\n", $@);
    };
}

# Read
sub read {
    my $self = shift;
    die;

    my $workspace_id = $self->param('workspace_id');
    my $scan_id = $self->param('scan_id');
    my $id = $self->param('id');

    eval {
        my $notifications = get_notifications($scan_id, $id);

        if ( @$notifications ) {
            # Check workspace id here
            if ( $$notifications[0][6] == $workspace_id ) {
                my $notification = {};

                my $i = 0;
                foreach my $prop ( qw(id subject recipients message trigger triggerName) ) {
                    $notification->{$prop} = $$notifications[0][$i];
                    $i++;
                }
                $self->render( json => $notification );
            } else {
                $self->error("Notification not found");
            }
        } else {
            $self->error("notification not found");
            return;
        }
    } or do {
        $self->error(join "\n", $@);
    };
}

# List
sub list {
    my $self = shift;

    my $workspace_id = $self->param('workspace_id');

    my $error = check_param("workspace", $workspace_id, 1);
    if ( $error ) {
        $self->error($error);
        return;
    }

    eval {
    my @data = map {
            my $recipientsHtml = $_->[3];
            $recipientsHtml =~ s/([-0-9a-zA-Z.+_]+\@[-0-9a-zA-Z.+_]+\.?[a-zA-Z]{0,4})/<a href="mailto:$1">$1<\/a>/g;
            {
                id              => $_->[0],
                name            => $_->[1],
                hosts           => $_->[2],
                recipients      => $_->[3],
                recipientsHtml  => $recipientsHtml,
            }
        } @{get_assets($workspace_id)};

        $self->render( json => \@data );
    } or do {
        $self->error(join "\n", $@);
    };
}

sub update {
    my $self = shift;

    my $asset = $self->req->json();
    my $workspace_id = $self->param('workspace_id');
    my $asset_id = $self->param('id');

    my $error = check_param("workspace", $workspace_id, 1);
    $error = check_param("id", $asset_id, 1) unless $error;
    $error = check_param("name", $asset->{name}, 0) unless $error;

    if ( $error ) {
        $self->error($error);
        return;
    }

    eval {

        my $rows = update_asset($workspace_id,$asset_id,$asset->{name},$asset->{hosts},$asset->{recipients});
        if ( $rows ) {
            my $new = {
                id          => $asset_id,
                name        => $asset->{name},
                hosts       => $asset->{hosts},
                recipients  => $asset->{recipients}
            };
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
    die;

    my $workspace_id = $self->param('workspace_id');
    my $scan_id = $self->param('scan_id');
    my $id = $self->param('id');

    my $oldnot = get_notifications($scan_id,$id);
    if ( $$oldnot[0][6] != $workspace_id ) {
        $self->error("Notification $id not found in scan $scan_id in workspace $workspace_id");
        return;
    }

    eval {
        my $sth = del_notification($id);
        if ( $sth ) {
            $self->render( json =>
                {
                    status => "OK",
                    message => "Notification deleted"
                },
                status => 200
            );
        } else {
            $self->error("Delete failed");
        }
    } or do {
        $self->error(join "\n", $@);
    };

}

1;
