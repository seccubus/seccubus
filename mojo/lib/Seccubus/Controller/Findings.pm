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
package Seccubus::Controller::Findings;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use SeccubusFindings;
use SeccubusIssues;
use Data::Dumper;

# Create
#sub create {
#	my $self = shift;
#
#}

# Read
#sub read {
#    my $self = shift;
#
#    eval {
#        my $data;
#        ($data->{username}, $data->{valid}, $data->{isadmin}, $data->{message}) = get_login();
#
#        $self->render( json => $data );
#    } or do {
#        $self->error(join "\n", $@);
#    };
#}

# List
sub list {
   my $self = shift;

    my $workspace_id = $self->param('workspace_id');
    my $scan_ids = $self->every_param("scanIds[]");
    my $asset_ids = $self->every_param("assetIds[]");
    my $limit = $self->param("Limit");

    my $config = get_config();

    $limit = 200 unless defined $limit;
    $limit += 0; # Make sure limit is numeric

    # Return an error if the required parameters were not passed
    if ( $workspace_id + 0 ne $workspace_id ) {
        $self->error("WorkspaceId is not numeric");
        return;
    };

    eval {
        my @data;
        my %filter;
        foreach my $key ( qw( Status Host HostName Port Plugin Severity Finding Remark Severity Issue ) ) {
            if (defined $self->param($key) && $self->param($key) !~ /^(all|null|\*)$/ ) {
                $filter{lc($key)} = $self->param($key);
            }
        }

        my $issues = get_issues($workspace_id,undef,1); # Get list of issues with finding_id;
        my %i2f;
        foreach my $issue ( @$issues ) {
            my $id = $$issue[8];
            if ( $id ) { # finding_id

                $i2f{$id} = [] unless $i2f{$id};
                my $i = {};
                $i->{id} = $$issue[0];
                $i->{name} = $$issue[1];
                $i->{ext_ref} = $$issue[2];
                $i->{description} = $$issue[3];
                $i->{severity} = $$issue[4];
                $i->{severityName} = $$issue[5];
                $i->{status} = $$issue[6];
                $i->{statusName} = $$issue[7];
                my $url = $config->{tickets}->{url_head} . $$issue[2] . $config->{tickets}->{url_tail} if $config->{tickets}->{url_head};
                $i->{url} = $url;
                push @{$i2f{$id}}, $i;
            }
        }

        if( @$asset_ids == 0 ){
            if ( @$scan_ids == 0 ) {
                push @$scan_ids, 0;
            }
            foreach my $scan_id ( @$scan_ids ) {
                my $findings = get_findings($workspace_id, $scan_id,'0', \%filter, $limit);

                foreach my $row ( @$findings ) {
                    push (@data, {
                        'id'            => $$row[0],
                        'host'          => $$row[1],
                        'hostName'      => $$row[2],
                        'port'          => $$row[3],
                        'plugin'        => $$row[4],
                        'find'          => $$row[5],
                        'remark'        => $$row[6],
                        'severity'      => $$row[7],
                        'severityName'  => $$row[8],
                        'status'        => $$row[9],
                        'statusName'    => $$row[10],
                        'scanId'        => $$row[11],
                        'scanName'      => $$row[12],
                        'issues'        => $i2f{$$row[0]}
                    });
                }
            }
        } else{
            foreach my $asset_id ( @$asset_ids ) {
                my $findings = get_findings($workspace_id, '0', $asset_id, \%filter, $limit);
                foreach my $row ( @$findings ) {
                    push (@data, {
                        'id'        => $$row[0],
                        'host'      => $$row[1],
                        'hostName'  => $$row[2],
                        'port'      => $$row[3],
                        'plugin'    => $$row[4],
                        'find'      => $$row[5],
                        'remark'    => $$row[6],
                        'severity'  => $$row[7],
                        'severityName'  => $$row[8],
                        'status'    => $$row[9],
                        'statusName'    => $$row[10],
                        'scanId'    => $$row[11],
                        'scanName'  => $$row[12],
                        'issues'    => $i2f{$$row[0]}
                    });
                }
            }
        }
        $self->render( json => \@data );
    } or do {
        $self->error(join "\n", $@);
    };
}

#sub update {
#	my $self = shift;
#
#}

#sub delete {
#	my $self = shift;
#
#}

1;
