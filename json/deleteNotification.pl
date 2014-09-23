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
# Gets notificationdata
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusNotifications;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d");
print $query->header(-"Cache-Control"=>"no-store, no-cache, must-revalidate");
print $query->header(-"Cache-Control"=>"post-check=0, pre-check=0");

my $notification_id = $query->param("id");

# Return an error if the required parameters were not passed 
if (not (defined ($notification_id))) {
	bye("Parameter id is missing");
} elsif ( $notification_id + 0 ne $notification_id ) {
	bye("id is not numeric");
};

eval {
	if ( del_notification($notification_id) ) {
		my @data;
		push (@data, {'id' => $notification_id});
		print $json->pretty->encode(\@data);
	} else {
		bye("Premission denied");
	}
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}
