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
# Unlinks a finding from an issue
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusIssues;
use Data::Dumper;

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
# Return an error if the required parameters were not passed 
if (not (defined ($params->{issueId}))) {
	bye("Parameter issueId is missing");
} elsif ( $params->{issueId} + 0 ne $params->{issueId} ) {
	bye("issueId is not numeric");
};
# Return an error if the required parameters were not passed 
if (not (defined ($params->{'findingIds[]'}))) {
	bye("Parameter findingIds[] are missing");
};

# A little translation
my $workspace_id = $params->{workspaceId};
my $issue_id = $params->{issueId};
my @finding_ids = split(/\0/, $params->{'findingIds[]'});

eval {
	my @data;
	foreach my $finding_id ( @finding_ids ) {
		issue_finding_link($workspace_id, $issue_id, $finding_id, 1);
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
