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
# Updates the findings passed by ID with the data passed
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

my $workspace_id = $query->param("attrs[workspaceId]");
my @ids = $query->param("ids[]");
my $remark = $query->param("attrs[remark]");
my $status = $query->param("attrs[status]");
my $overwrite = $query->param("attrs[overwrite]");

if ( $overwrite eq "true" || $overwrite eq "on" ) {
	$overwrite = 1;
} else {
	$overwrite = 0;
}

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
};
if (@ids == 0) {
	bye("No id's passed");
};

if ( $status < 0 || ( $status > 6 && $status != 99 ) ) {
	bye("Invalid status code");
}

eval {
	my @data = ();
	foreach my $id (@ids) { 
		# Only updat e the remark when we overwrite or when the
		# remark isn't empty. This prevents that an empty line is added
		# on each update
		if ( $overwrite || $remark ) {
			update_finding(	"finding_id"	=> $id,
				"workspace_id"	=> $workspace_id,
				"status"	=> $status,
				"remark"	=> $remark,
				"overwrite"	=> $overwrite,
			);
		} else {
			update_finding(	"finding_id"	=> $id,
				"workspace_id"	=> $workspace_id,
				"status"	=> $status,
			);
		}
	};
	print $json->pretty->encode(\@data);
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}



