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
# Get a full list of findings associated with the filter parameters given
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusIssues;
use SeccubusFindings;
use Data::Dumper;

my $query = CGI::new();
my $json = JSON->new();
my $config = get_config();

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate", -"X-Clacks-Overhead" => "GNU Terry Pratchett");

my $params = $query->Vars;
my $workspace_id = $params->{workspaceId};
my $issue_id = $params->{issueId};

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
};

eval {
	my @data;
	my $issues = get_issues($workspace_id, $params->{issueId});
	foreach my $row ( @$issues ) {
		my $url = "";
		if ( $config->{tickets}->{url_head} ) {
			$url = $config->{tickets}->{url_head} . $$row[2] . $config->{tickets}->{url_tail};
		}
		push (@data, {
			'id'			=> $$row[0],
			'name'			=> $$row[1],
			'ext_ref'		=> $$row[2],
			'description'	=> $$row[3],
	 		'severity'		=> $$row[4],
			'severityName'	=> $$row[5],
			'status'		=> $$row[6],
			'statusName'	=> $$row[7],
			'url'			=> $url, 
		});
	}
	foreach my $issue ( @data ) {
		my $findings_in = get_findings($workspace_id, undef, undef, { 'issue' => $issue->{id} } );
		my $findings_out = [];
		foreach my $row ( @$findings_in ) {
			push ( @$findings_out, {
				'id'			=> $$row[0],
				'host'			=> $$row[1],
				'hostName'		=> $$row[2],
				'port'			=> $$row[3],
				'plugin'		=> $$row[4],
				'find'			=> $$row[5],
				'remark'		=> $$row[6],
		 		'severity'		=> $$row[7],
				'severityName'	=> $$row[8],
				'status'		=> $$row[9],
				'statusName'	=> $$row[10],
				'scanId'		=> $$row[11],
				'scanName'		=> $$row[12],
			});
		}
		$issue->{findings} = $findings_out;
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
