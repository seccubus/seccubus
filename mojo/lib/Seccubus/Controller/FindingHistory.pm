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
package Seccubus::Controller::FindingHistory;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use SeccubusV2;
use SeccubusFindings;
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
#}

# List
sub list {
    my $self = shift;

    my $workspace_id = $self->param('workspace_id');
    my $finding_id = $self->param('finding_id');

    if ( $workspace_id + 0 ne $workspace_id ) {
        $self->error("WorkspaceId is not numeric");
        return;
    } elsif ( $finding_id + 0 ne $finding_id ) {
        $self->error("FindingId is not numeric");
        return;
    } elsif ( $finding_id eq 0 ) {
        $self->error("Parameter findingId is missing");
        return;
    };

    eval {
        my @data;
        my $history = get_finding($workspace_id, $finding_id);

        foreach my $row ( @$history ) {
            push (@data, {
                'id'        => $$row[0],
                'findingId' => $$row[1],
                'host'      => $$row[2],
                'hostName'  => $$row[3],
                'port'      => $$row[4],
                'plugin'    => $$row[5],
                'finding'   => $$row[6],
                'remark'    => $$row[7],
                'severity'  => $$row[8],
                'severityName'  => $$row[9],
                'status'    => $$row[10],
                'statusName'    => $$row[11],
                'userId'    => $$row[12],
                'user'      => $$row[13],
                'time'      => $$row[14],
                'scanId'    => $$row[15],
            });
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
