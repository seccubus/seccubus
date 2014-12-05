#!/usr/bin/env perl
# Copyright 2014 Frank Breedijk
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
# Get a representation of the filters based on the filter parameters given
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

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate");

my $workspace_id = $query->param("workspaceId");
my @scan_ids = $query->param("scanIds[]");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
} elsif ( 0 == @scan_ids ) {
	bye("Scan_ids is a mandatory parameter");
};

eval {
	my @data;
	my %filter;
	foreach my $key ( qw( Status Host Hostname Port Plugin Severity Finding Remark Severity ) ) {
		if ( $query->param($key) ne undef and $query->param($key) ne "all" and $query->param($key) ne "null" and $query->param($key) ne "*" ) {
			$filter{lc($key)} = $query->param($key); 
		}
	}

	my %filters = get_filters($workspace_id, \@scan_ids, \%filter);

	print $json->pretty->encode(\%filters);
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}
