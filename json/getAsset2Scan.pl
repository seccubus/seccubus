#!/usr/bin/env perl
# Copyright 2015 Petr, Frank Breedijk
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
# Gets notificationdata
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusAssets;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate", -"X-Clacks-Overhead" => "GNU Terry Pratchett");

my $params = $query->Vars;
my $scan_id = $params->{scanid};

# Return an error if the required parameters were not passed 
bye("Parameter scanid is missing") if (not (defined ($scan_id)));
bye("scanid is not numeric") if ( $scan_id + 0 ne $scan_id );
	
eval {
	my @data = map {
		{
		scan_id => $_->[0],
		asset_id => $_->[1]
		}
	} @{get_asset2scan($scan_id)};
	print $json->pretty->encode(\@data);
} or do { bye(join "\n", $@); };


	
sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}
