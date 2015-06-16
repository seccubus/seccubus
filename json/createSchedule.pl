#!/usr/bin/env perl
# Copyright 2014 Frank Breedijk, Petr
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
use SeccubusScanSchedule;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate");

my $workspace_id = $query->param("workspaceId");
my $scan_id = $query->param("scanId");
my $month = $query->param("month");
my $week = $query->param('week');
my $day = $query->param('day');
my $hour = $query->param('hour');
my $min = $query->param('min');

# Return an error if the required parameters were not passed 
my $error;
bye($error) if ($error = check_param("workspaceId", $workspace_id, 1));
bye($error) if ($error = check_param("scanId", $scan_id, 1));
bye($error) if ($error = check_param("month", $month, 0));
bye($error) if ($error = check_param("week", $week, 0));
bye($error) if ($error = check_param("day", $day, 0));

eval {
	my @data = ();
	my ($newid) = create_schedule($workspace_id,$scan_id,$month,$week,$day,$hour,$min);
	push @data, {
		id => $newid,
		month => $month,
		week => $week,
		day => $day,
		hour => $hour,
		min => $min
	};
	print $json->pretty->encode(\@data);
} or do { bye(join "\n", $@); };

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}