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
# This little script checks all files te see if they are perl files and if so 
# ------------------------------------------------------------------------------

use strict;
use Algorithm::Diff qw( diff );
use JSON;
use Data::Dumper;
use Test::More;
my $tests = 0;

if (`hostname` =~ /^sbpd/) {
	$tests = 1;
	ok("Skipping these tests on the final build system");
} else {
	my $db_version = 0;
	foreach my $data_file (<db/data_v*.mysql>) {
		$data_file =~ /^db\/data_v(\d+)\.mysql$/;
		$db_version = $1 if $1 > $db_version;
	}
	
	ok($db_version > 0, "DB version = $db_version"); $tests++;
	`mysql -uroot -e "drop database seccubus"`;
	`mysql -uroot -e "create database seccubus"`;
	`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
	`mysql -uroot -e "flush privileges;"`;
	`mysql -uroot seccubus < db/structure_v$db_version.mysql`;
	`mysql -uroot seccubus < db/data_v$db_version.mysql`;

	my $json = webcall("ConfigTest.pl");
	foreach my $t ( @$json ) {
		if ( $t->{name} ne "Configuration file" ) { # Skip in container
			is($t->{result}, "OK", "$t->{name} ($t->{result}) eq OK?");
			$tests++;
		}
	}

	# Create a workspace
	$json = webcall("createWorkspace.pl", "name=test1");
	is($$json[0]->{id},100,"Workspace created"); $tests++;
	# Create a scan
	$json = webcall("createScan.pl", "workspaceId=100", "name=ssl", "scanner=SSLlabs", "parameters=--hosts+\@HOSTS+--from-cache+--publish", "targets=www.seccubus.com\%0Awww.schubergphilis.com");
	is(@$json, 1, "Correct number of records returned"); $tests++;
	is($$json[0]->{id}, 1, "Correct ID returned"); $tests++;
	is($$json[0]->{name}, "ssl", "Correct name returned"); $tests++;
	is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned"); $tests++;
	is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache --publish', "Correct parameters returned"); $tests++;
	is($$json[0]->{targets}, "www.seccubus.com\nwww.schubergphilis.com", "Correct targets returned"); $tests++;
	is($$json[0]->{workspace}, 100, "Correct workspace returned"); $tests++;
	is($$json[0]->{password}, undef, "Correct password returned"); $tests++;
	
	# Add notifications
	# Need numeric workspaceId
	$json = webcall("createNotification.pl", "scanId=1", "trigger=1", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;
	$json = webcall("createNotification.pl", "workspaceId=a", "scanId=1", "trigger=1", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;

	# Need numeric scanId
	$json = webcall("createNotification.pl", "workspaceId=100", "trigger=1", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=a", "trigger=1", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;

	# Need numeric trigger 1,2 or 3
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=a", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=0", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=4", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;

	# Need subject
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=1", 
		"recipients=root\@example.com", "message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;

	# Need recipients
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=1", "subject=test1", 
		"message=bla");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;

	# Need message
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=1", "subject=test1", 
		"recipients=root\@example.com");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;

	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=1", "subject=test1", 
		"recipients=root\@example.com", "message=bla");
	is(@$json, 1, "Correct number of records returned"); $tests++;
	is($$json[0]->{id}, 1, "Correct ID returned"); $tests++;
	is($$json[0]->{event_id}, 1, "Correct event ID returned"); $tests++;
	is($$json[0]->{event_name}, 'Before scan', "Correct event name returned"); $tests++;
	is($$json[0]->{subject}, 'test1', "Correct subject returned"); $tests++;
	is($$json[0]->{recipients}, 'root@example.com', "Correct recipient returned"); $tests++;
	is($$json[0]->{message}, 'bla', "Correct message returned"); $tests++;
	my $json_create1 = $$json[0];
	
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=2", "subject=test2", 
		"recipients=root\@example.com", "message=bla");
	is(@$json, 1, "Correct number of records returned"); $tests++;
	is($$json[0]->{id}, 2, "Correct ID returned"); $tests++;
	is($$json[0]->{event_id}, 2, "Correct event ID returned"); $tests++;
	is($$json[0]->{event_name}, 'After scan', "Correct event name returned"); $tests++;
	is($$json[0]->{subject}, 'test2', "Correct subject returned"); $tests++;
	is($$json[0]->{recipients}, 'root@example.com', "Correct recipient returned"); $tests++;
	is($$json[0]->{message}, 'bla', "Correct message returned"); $tests++;
	my $json_create2 = $$json[0];
	
	$json = webcall("createNotification.pl", "workspaceId=100", "scanId=1", "trigger=3", "subject=test3", 
		"recipients=root\@example.com", "message=bla");
	is(@$json, 1, "Correct number of records returned"); $tests++;
	is($$json[0]->{id}, 3, "Correct ID returned"); $tests++;
	is($$json[0]->{event_id}, 3, "Correct event ID returned"); $tests++;
	is($$json[0]->{event_name}, 'On Open', "Correct event name returned"); $tests++;
	is($$json[0]->{subject}, 'test3', "Correct subject returned"); $tests++;
	is($$json[0]->{recipients}, 'root@example.com', "Correct recipient returned"); $tests++;
	is($$json[0]->{message}, 'bla', "Correct message returned"); $tests++;
	my $json_create3 = $$json[0];

	# Read notifications back

	# Must have numeric scanId
	$json = webcall("getNotifications.pl");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;
	$json = webcall("getNotifications.pl", "scanId=a");
	isnt($$json[0]->{error}, undef, "Got error"); $tests++;

	# Happy flow
	$json = webcall("getNotifications.pl", "scanId=1");
	is(@$json, 3, "Correct number of records returned"); $tests++;
	is_deeply($$json[0], $json_create1, "Objects match"); $tests++;
	is_deeply($$json[1], $json_create2, "Objects match"); $tests++;
	is_deeply($$json[2], $json_create3, "Objects match"); $tests++;
	
	# Lets run a scan
	my $output = `perl -MSeccubusV2 -I SeccubusV2 bin/do-scan -w test1 -s ssl`;

	like($output, qr/Sending notifications for scan start\.\.\.\r?\n?\-?1 notification\(s\) sent/, "Pre scan notifications sent"); $tests++;
	like($output, qr/Sending notifications for scan end\.\.\.\r?\n?\-?1 notification\(s\) sent/, "Post scan notifications sent"); $tests++;

	# Lets read back scans
	$json = webcall("getScans.pl", "workspaceId=100");
	is(@$json, 1, "Correct number of records returned"); $tests++;
	is($$json[0]->{notifications}, 3, "Correct number of notifications set"); $tests++;
	is($$json[0]->{runs}, 1, "Scan did run"); $tests++;
}

done_testing($tests);

sub webcall(@) {
	my $call = shift;

	my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/$call ";
	$cmd .= join " ", @_;
	my @result = split /\r?\n/, `$cmd`;
	ok($cmd, "Ran: $cmd"); $tests++;
	while ( shift @result ) {};
	return decode_json(join "\n", @result);
}
