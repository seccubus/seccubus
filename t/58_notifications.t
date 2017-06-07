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

use lib "lib";

use SeccubusV2;
use Seccubus::Scans;

my $db_version = 0;
foreach my $data_file (<db/data_v*.mysql>) {
	$data_file =~ /^db\/data_v(\d+)\.mysql$/;
	$db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -uroot -e "drop database seccubus"`;
`mysql -uroot -e "create database seccubus"`;
`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
`mysql -uroot -e "flush privileges;"`;
`mysql -uroot seccubus < db/structure_v$db_version.mysql`;
`mysql -uroot seccubus < db/data_v$db_version.mysql`;

my $t = Test::Mojo->new('Seccubus');

# Log in
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200,"Login ok")
;

# Create Workspace
$t->post_ok('/api/workspaces',
	json => {
		'name' 			=> 'workspace1',
	})
	->status_is(200)
	->json_is('/id',100)
	->json_is('/name','workspace1')
	;

# Create scan
$t->post_ok('/api/workspace/100/scans',
	json => {
		'name' 			=> 'ssl',
		'scanner'		=> 'SSLlabs',
		'parameters'	=> '--hosts @HOSTS --from-cache --publish',
		'password'		=> '',
        #'targets'       => "www.seccubus.com\nwww.schubergphilis.com",
        'targets'       => "",
	})
	->status_is(200)
	;

# Create scan
$t->post_ok('/api/workspace/100/scans',
	json => {
		'name' 			=> 'ssl2',
		'scanner'		=> 'SSLlabs',
		'parameters'	=> '--hosts @HOSTS --from-cache --publish',
		'password'		=> '',
        #'targets'       => "www.seccubus.com\nwww.schubergphilis.com",
		'targets'		=> "",
	})
	->status_is(200)
	;

# Cannot create notification for non-existing workspace
$t->post_ok('/api/workspace/101/scan/1/notifications',
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
$t->post_ok('/api/workspace/100/scan/3/notifications',
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
$t->post_ok('/api/workspace/100/scan/1/notifications',
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

$t->post_ok('/api/workspace/100/scan/4/notifications',
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

$t->post_ok('/api/workspace/100/scan/a/notifications',
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
$t->post_ok('/api/workspace/100/scan/1/notifications',
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
$t->post_ok('/api/workspace/100/scan/1/notifications',
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
$t->post_ok('/api/workspace/100/scan/1/notifications',
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
$t->post_ok('/api/workspace/100/scan/1/notifications',
	json => {
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message')
	;

# Create one tigger 1
$t->post_ok('/api/workspace/100/scan/1/notifications',
	json => {
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
		trigger => 1,
	})
	->status_is(200)
	->json_is({
		id => 1,
		subject => "test1",
		recipients => 'root@example.com',
		message => 'bla',
		trigger => 1,
		triggerName => 'Before scan'
	})
	;

# Create one tigger 2
$t->post_ok('/api/workspace/100/scan/1/notifications',
	json => {
		subject => "test2",
		recipients => 'root@example.com',
		message => 'bla',
		trigger => 2,
	})
	->status_is(200)
	->json_is({
		id => 2,
		subject => "test2",
		recipients => 'root@example.com',
		message => 'bla',
		trigger => 2,
		triggerName => 'After scan'
	})
	;
# Create one tigger 3
$t->post_ok('/api/workspace/100/scan/1/notifications',
	json => {
		subject => "test3",
		recipients => 'root@example.com',
		message => 'bla',
		trigger => 3,
	})
	->status_is(200)
	->json_is({
		id => 3,
		subject => "test3",
		recipients => 'root@example.com',
		message => 'bla',
		trigger => 3,
		triggerName => 'On Open'
	})
	;

# Three notifications for scan 1
$t->get_ok('/api/workspace/100/scan/1/notifications')
	->status_is(200)
	->json_has("/2")
	->json_is([
		{
			id => 1,
			subject => "test1",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 1,
			triggerName => 'Before scan'
		},
		{
			id => 2,
			subject => "test2",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 2,
			triggerName => 'After scan'
		},
		{
			id => 3,
			subject => "test3",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 3,
			triggerName => 'On Open'
		}
	])
	;

# Let's run a scan
pass("Starting a scan");
my $output = `(perl bin/do-scan -w workspace1 -s ssl)`;
is($?,0,"Scan finished without error");

like($output, qr/Sending notifications for scan start\.\.\.\r?\n?\-?1 notification\(s\) sent/, "Pre scan notifications sent");
like($output, qr/Sending notifications for scan end\.\.\.\r?\n?\-?1 notification\(s\) sent/, "Post scan notifications sent");


# No notifications for scan 2
$t->get_ok('/api/workspace/100/scan/2/notifications')
	->status_is(200)
	->json_is([])
	;

# No notifications for scan 1 in wrong workspace
$t->get_ok('/api/workspace/101/scan/1/notifications')
	->status_is(200)
	->json_is([])
	;

# Can read individual notifications
$t->get_ok('/api/workspace/100/scan/1/notification/1')
	->status_is(200)
	->json_is(
		{
			id => 1,
			subject => "test1",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 1,
			triggerName => 'Before scan'
		}
	)
	;

$t->get_ok('/api/workspace/100/scan/1/notification/2')
	->status_is(200)
	->json_is(
		{
			id => 2,
			subject => "test2",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 2,
			triggerName => 'After scan'
		}
	)
	;

$t->get_ok('/api/workspace/100/scan/1/notification/3')
	->status_is(200)
	->json_is(
		{
			id => 3,
			subject => "test3",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 3,
			triggerName => 'On Open'
		}
	)
	;

# Update
$t->put_ok('/api/workspace/100/scan/1/notification/1',
	json => {
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => 2,
	})
	->status_is(200)
	->json_is(
		{
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => 2,
			triggerName => 'After scan'
		}
	)
	;

# Can read individual notifications
$t->get_ok('/api/workspace/100/scan/1/notification/1')
	->status_is(200)
	->json_is(
		{
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => 2,
			triggerName => 'After scan'
		}
	)
	;

# Three notifications for scan 1
$t->get_ok('/api/workspace/100/scan/1/notifications')
	->status_is(200)
	->json_has("/2")
	->json_is([
		{
			id => 2,
			subject => "test2",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 2,
			triggerName => 'After scan'
		},
		{
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => 2,
			triggerName => 'After scan'
		},
		{
			id => 3,
			subject => "test3",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 3,
			triggerName => 'On Open'
		},
	])
	;

# Cannot update to empty subject
$t->put_ok('/api/workspace/100/scan/1/notification/1',
	json => {
			id => 1,
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => 2,
	})
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

# Cannot update to empty recipients
$t->put_ok('/api/workspace/100/scan/1/notification/1',
	json => {
			id => 1,
			subject => "test4",
			message => 'iets',
			trigger => 2,
	})
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

# Cannot update to empty message
$t->put_ok('/api/workspace/100/scan/1/notification/1',
	json => {
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			trigger => 2,
	})
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

# Cannot update to non existing trigger
$t->put_ok('/api/workspace/100/scan/1/notification/1',
	json => {
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => 0,
	})
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

$t->put_ok('/api/workspace/100/scan/1/notification/1',
	json => {
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => 4,
	})
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

$t->put_ok('/api/workspace/100/scan/1/notification/1',
	json => {
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => "a",
	})
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

# Cannot update non-existing notification
$t->put_ok('/api/workspace/100/scan/5/notification/5',
	json => {
			id => 1,
			subject => "test4",
			recipients => 'toor@example.com',
			message => 'iets',
			trigger => 1,
	})
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

# Can delete a notification
$t->delete_ok('/api/workspace/100/scan/1/notification/1')
	->status_is(200)
	->json_is("/status", "OK")
	->json_has("/message")
	;

# Two notifications for scan 1
$t->get_ok('/api/workspace/100/scan/1/notifications')
	->status_is(200)
	->json_is([
		{
			id => 2,
			subject => "test2",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 2,
			triggerName => 'After scan'
		},
		{
			id => 3,
			subject => "test3",
			recipients => 'root@example.com',
			message => 'bla',
			trigger => 3,
			triggerName => 'On Open'
		},
	])
	;

$t->get_ok('/api/workspace/100/scan/1/notification/1')
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

$t->delete_ok('/api/workspace/100/scan/1/notification/1')
	->status_is(400)
	->json_is("/status", "Error")
	->json_has("/message")
	;

done_testing();
exit;

