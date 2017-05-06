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
package Seccubus::Controller::IssueHistory;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use SeccubusV2;
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
#}

# List
sub list {
    my $self = shift;

    my $workspace_id = $self->param('workspace_id');
    my $issue_id = $self->param('issue_id');

    if ( $workspace_id + 0 ne $workspace_id ) {
        $self->error("WorkspaceId is not numeric");
        return;
    } elsif ( $issue_id + 0 ne $issue_id ) {
        $self->error("issue_id is not numeric");
        return;
    };

    eval {
        my @data;
        my $history = get_issue($workspace_id, $issue_id);

        foreach my $row ( @$history ) {
            push (@data, {
                'id'            => $$row[0],
                'issueId'       => $$row[1],
                'name'          => $$row[2],
                'ext_ref'       => $$row[3],
                'description'   => $$row[4],
                'severity'      => $$row[5],
                'severityName'  => $$row[6],
                'status'        => $$row[7],
                'statusName'    => $$row[8],
                'userId'        => $$row[9],
                'userName'      => $$row[10],
                'timestamp'     => $$row[11],
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
