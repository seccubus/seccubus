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

my $schedule_id = $query->param('id');
bye('no ScheduleId') if(!$schedule_id);
my $enabled = $query->param('enabled') ? 1 : '0';
my $launch = $query->param('launch');
my $month = $query->param('month');
my $day = $query->param('day');
my $hour = $query->param('hour');
my $min = $query->param('min');
my $wday = $query->param('wday');
my $week = $query->param('week');



eval {
	my @data = ();
	my ($newid) = update_schedule($schedule_id,$enabled,$launch,$month,$week,$wday,$day,$hour,$min);
	push @data, {
		id => $schedule_id,
		enabled => $enabled,
		launch => $launch,
		month => $month,
		week => $week,
		wday => $wday,
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