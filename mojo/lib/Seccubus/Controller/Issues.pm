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
package Seccubus::Controller::Issues;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use SeccubusV2;
use SeccubusIssues;
use SeccubusFindings;
use Data::Dumper;

# Create
sub create {
	my $self = shift;

    my $workspace_id = $self->param('workspace_id');

    my $issue = $self->req->json();
    delete $issue->{id};
    delete $issue->{issue_id};

    unless ( $issue ) {
        $self->error("Invalid or empty request body");
        return;
    }

    # Check parameters
    if ( $workspace_id + 0 ne $workspace_id ) {
        $self->error("Workspace_id is not numeric");
        return;
    };
    unless ( $issue->{name} ) {
        $self->error("Issue needs to have a name");
        return;
    }
    $issue->{severity} = 0 unless $issue->{severity};
    $issue->{status} = 1 unless $issue->{status};

    # A little translation
    $issue->{workspace_id} = $workspace_id;
    $issue->{findings_add} = $issue->{'findings'};

    eval {
        $issue->{id} = update_issue(%$issue) + 0;
        delete $issue->{findings_add};
        $self->render( json => $issue );
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

    my $config = get_config();

    my $workspace_id = $self->param('workspace_id');
    my $finding_id = $self->param('finding');

    if ( $workspace_id + 0 ne $workspace_id ) {
        $self->error("WorkspaceId is not numeric");
    };
    if ( $finding_id && $finding_id + 0 ne $finding_id ) {
        $self->error("finding_id is not numeric");
    }

    eval {
        my @data;
        my $issues;
        $issues = get_issues($workspace_id, undef, undef, $finding_id);

        foreach my $row ( @$issues ) {
            my $url = "";
            if ( $config->{tickets}->{url_head} ) {
                $url = $config->{tickets}->{url_head} . $$row[2] . $config->{tickets}->{url_tail};
            }
            push (@data, {
                'id'            => $$row[0],
                'name'          => $$row[1],
                'ext_ref'       => $$row[2],
                'description'   => $$row[3],
                'severity'      => $$row[4],
                'severityName'  => $$row[5],
                'status'        => $$row[6],
                'statusName'    => $$row[7],
                'url'           => $url,
            });
        }
        foreach my $issue ( @data ) {
            my $findings_in = get_findings($workspace_id, undef, undef, { 'issue' => $issue->{id} } );
            my $findings_out = [];
            foreach my $row ( @$findings_in ) {
                push ( @$findings_out, {
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
                });
            }
            $issue->{findings} = $findings_out;
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
