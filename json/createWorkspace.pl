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
# Creates a new workspace
# ------------------------------------------------------------------------------
use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusWorkspaces;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate", -"X-Clacks-Overhead" => "GNU Terry Pratchett");

my $workspace_id = $query->param("workspaceId");
my $id = $query->param("id");
my $remark = $query->param("remark");
my $status = $query->param("status");
my $overwrite = $query->param("overwrite");

if ( $overwrite eq "true" || $overwrite == 1 ) {
	$overwrite = 1;
} else {
	$overwrite = 0;
}

# Return an error if the required parameters were not passed 
my $workspace_name = $query->param("name");
if (not (defined ($workspace_name))) {
	bye("Parameter name is missing");
};

eval {
	my @data = ();
	my $newid = create_workspace($workspace_name);
	push @data, {
		id		=> $newid,
		name		=> $workspace_name,
		scanCount	=> 0,
		findCount	=> 0
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

