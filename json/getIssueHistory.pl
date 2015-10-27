#!/usr/bin/env perl
# Copyright 2015 Frank Breedijk
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
# ------------------------------------------------------------------------------
# Get a full list of issues changes associated with issueId given
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusIssues;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate", -"X-Clacks-Overhead" => "GNU Terry Pratchett");

my $params = $query->Vars;
my $workspace_id = $query->param("workspaceId");
my $issue_id = $query->param("issueId");
$issue_id = 0 unless $issue_id;

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
} elsif ( $issue_id + 0 ne $issue_id ) {
	bye("issueId is not numeric");
} elsif ( $issue_id eq 0 ) {
	bye("Parameter issueId is missing");
};

eval {
	my @data;
	my $history = get_issue($workspace_id, $issue_id);

	foreach my $row ( @$history ) {
		push (@data, {
			'id'			=> $$row[0],
			'issueId'		=> $$row[1],
			'name'			=> $$row[2],
			'ext_ref'		=> $$row[3],
			'description'	=> $$row[4],
			'severity'		=> $$row[5],
			'severityName'	=> $$row[6],
			'status'		=> $$row[7],
			'statusName'	=> $$row[8],
			'userId'		=> $$row[9],
			'userName'		=> $$row[10],
			'timestamp'		=> $$row[11],
		});
	}
	print $json->pretty->encode(\@data);
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}
