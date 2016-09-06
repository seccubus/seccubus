#!/usr/bin/env perl
# Copyright 2015 Frank Breedijk, Petr
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
# Gets schedules
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusScanSchedule;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate");

my $scan_id = $query->param("scanId");

# Return an error if the required parameters were not passed 
my $error;
bye($error) if $error = check_param("ScanId", $scan_id, 1);

eval {
	my $rows = get_schedules($scan_id);
	print $json->pretty->encode($rows);
	} or do { bye(join "\n", $@); };

sub bye($){
	my $error = shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}
