#!/usr/bin/env perl
# Copyright 2017 Frank Breedijk
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
use Mojo::Base -strict;

use strict;

use Test::More;
use Test::Mojo;
use Data::Dumper;

my $db_version = 0;
foreach my $data_file (<../db/data_v*.mysql>) {
	$data_file =~ /^\.\.\/db\/data_v(\d+)\.mysql$/;
	$db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -uroot -e "drop database seccubus"`;
`mysql -uroot -e "create database seccubus"`;
`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
`mysql -uroot -e "flush privileges;"`;
`mysql -uroot seccubus < ../db/structure_v$db_version.mysql`;
`mysql -uroot seccubus < ../db/data_v$db_version.mysql`;

my $t = Test::Mojo->new('Seccubus');

# Create Workspace
$t->post_ok('/workspaces', 
	json => { 
		'name' 			=> 'workspace1',
	})
	->status_is(200)
	->json_is('/id',100)
	->json_is('/name','workspace1')
	;
	
# Create scan
$t->post_ok('/workspace/100/scans', 
	json => { 
		'name' 			=> 'ssl',
		'scanner'		=> 'SSLlabs',
		'parameters'	=> '--hosts @HOSTS --from-cache --publish',
		'password'		=> '',
		'targets'		=> "www.seccubus.com\nwww.schubergphilis.com",
	})
	->status_is(200)
	;

# Cannot create notification for non-existing workspace
$t->post_ok('/workspace/101/scan/1/notifications',
	json => {
		trigger => 1,
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

# Cannot create notification for non-existing workspace
$t->post_ok('/workspace/100/scan/2/notifications',
	json => {
		trigger => 1,
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

# Cannot create notification for non-existing trigger
$t->post_ok('/workspace/100/scan/1/notifications',
	json => {
		trigger => 0,
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

$t->post_ok('/workspace/100/scan/4/notifications',
	json => {
		trigger => 0,
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

$t->post_ok('/workspace/100/scan/a/notifications',
	json => {
		trigger => 0,
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

# Cannot create without subject
$t->post_ok('/workspace/100/scan/1/notifications',
	json => {
		trigger => 0,
		recipients => 'root@example.com',
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

# Cannot create without recipient
$t->post_ok('/workspace/100/scan/1/notifications',
	json => {
		trigger => 0,
		subject => "test1",
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

# Cannot create without message
$t->post_ok('/workspace/100/scan/1/notifications',
	json => {
		trigger => 0,
		subject => "test1",
		recipients => 'root@example.com',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

# Cannot create without trigger
$t->post_ok('/workspace/100/scan/1/notifications',
	json => {
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

# Create one
$t->post_ok('/workspace/100/scan/1/notifications',
	json => {
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
		trigger => 1
	})
	->status_is(200)
	->json_is({
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
		trigger => 1
	})
	;

done_testing();
exit;
	my $json;
	my $tests;
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
done_testing();

sub weball (){};
