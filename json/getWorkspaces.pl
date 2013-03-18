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
# List the scans
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusWorkspaces;
#use HTML::Entities;

my $query = CGI::new();
my $json = JSON->new();
my $count = 0;
my @data;

print $query->header(-type => "application/json", -expires => "-1d");

my $workspaces = get_workspaces;
foreach my $row ( @$workspaces ) {
	push @data, {
		'id'		=> $$row[0],
		'name'		=> $$row[1],
		'lastScan'	=> $$row[2],
		'findCount'	=> $$row[3],
		'scanCount'	=> $$row[4],
	};
};

print $json->pretty->encode(\@data);
exit;
