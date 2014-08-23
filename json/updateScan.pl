#!/usr/bin/env perl
# Copyright 2013 Frank Breedijk
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
# Updates a scan
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusScans;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d");

my $scan_id = $query->param("id");
my $workspace_id = $query->param("workspace");
my $name = $query->param("name");
my $scanner = $query->param("scanner");
my $parameters = $query->param("parameters");
my $password = $query->param("password");
my $targets = $query->param("targets");

# Return an error if the required parameters were not passed 
if (not (defined ($scan_id))) {
	bye("Parameter id is missing");
};
if (not (defined ($workspace_id))) {
	bye("Parameter workspace is missing");
};
if (not (defined ($name))) {
	bye("Parameter name is missing");
};
if (not (defined ($scanner))) {
	bye("Parameter scanner is missing");
};
if (not (defined ($parameters))) {
	bye("Parameter parameters is missing");
};
if (not (defined ($password))) {
        bye("Parameter password is missing");
};
if (not (defined ($targets))) {
	bye("Parameter targets is missing");
};

eval {
	my @data = ();
	update_scan($workspace_id,$scan_id,$name,$scanner,$parameters,$password,$targets);
	push @data, {
		name		=> $name,
		scanner		=> $scanner,
		parameters	=> $parameters,
		password	=> $password,
		targets		=> $targets,
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

