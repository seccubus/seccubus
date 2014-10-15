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

# Fixes Ticket [ 2981907 ] - Online up2date check
use strict;
use lib "..";
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use SeccubusV2;
use LWP::Simple;
use JSON;

#my (
   #);

my $query = CGI::new();
my $json = JSON->new();
my $data = [];

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate");

my $verdict = get("http://v2.seccubus.com/up2date.json.pl?version=$SeccubusV2::VERSION");
if ( ! $verdict ) {
	print $json->pretty->encode( [ {
		'status'	=> "Error",
		'message'	=> "Cannot check version online! Online version checks are disabled",
		'link'		=> "",
	} ]);
} else { 
	print $verdict;
}
exit;
