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
use SeccubusFindings;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate", -"X-Clacks-Overhead" => "GNU Terry Pratchett");

my $workspace_id = $query->param("workspaceId");
my $finding_id = $query->param("findingId");
$finding_id = 0 unless $finding_id;

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
} elsif ( $finding_id + 0 ne $finding_id ) {
	bye("FindingId is not numeric");
} elsif ( $finding_id eq 0 ) {
	bye("Parameter findingId is missing");
};

eval {
	my @data;
	my $history = get_finding($workspace_id, $finding_id);

	foreach my $row ( @$history ) {
		push (@data, {
			'id'		=> $$row[0],
			'findingId'	=> $$row[1],
			'host'		=> $$row[2],
			'hostName'	=> $$row[3],
			'port'		=> $$row[4],
			'plugin'	=> $$row[5],
			'finding'	=> $$row[6],
			'remark'	=> $$row[7],
		 	'severity'	=> $$row[8],
			'severityName'	=> $$row[9],
			'status'	=> $$row[10],
			'statusName'	=> $$row[11],
			'userId'	=> $$row[12],
			'user'		=> $$row[13],
			'time'		=> $$row[14],
			'scanId'	=> $$row[15],
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
