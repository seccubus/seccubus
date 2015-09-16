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
# List the scans
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

# Return an error if the required parameters were not passed 
if (not (defined ($params->{workspaceId}))) {
	bye("Parameter workspaceId is missing");
} elsif ( $params->{workspaceId} + 0 ne $params->{workspaceId} ) {
	bye("WorkspaceId is not numeric");
};
bye("Need to specify a name") unless ( $params->{name} || $params->{issueId} );
$params->{severity} = 0 unless ( $params->{severity} || $params->{issueId} );
$params->{status} = 1 unless ( $params->{status} || $params->{issueId} );

# A little translation
$params->{workspace_id} = $params->{workspaceId};
$params->{issue_id} = $params->{issueId};

eval {
	my @data;
	my $issues = update_issue(%$params);

	if ($params->{issue_id}) {
		foreach my $row ( @$issues ) {
			push (@data, {
				'id'			=> $$row[0],
				'name'			=> $$row[1],
				'ext_ref'		=> $$row[2],
				'description'	=> $$row[3],
		 		'severity'		=> $$row[4],
				'severityName'	=> $$row[5],
				'status'		=> $$row[6],
				'statusName'	=> $$row[7],
			});
		}
	} else {
		@data = $issues;
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
