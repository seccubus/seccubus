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

my $db_version = 0;
foreach my $data_file (glob "db/data_v*.mysql") {
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
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin', "content-type" => "application/json" })
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

$t->post_ok('/api/workspaces',
	json => {
		'name' 			=> 'workspace2',
	})
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','workspace2')
	;

# Simple create
$t->post_ok('/api/workspace/100/scans',
	json => {
		'name' 			=> 'nessus1',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost',
	})
	->status_is(200)
	->json_is({
		'id'			=> 1,
		'workspace'		=> 100,
		'name' 			=> 'nessus1',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost',
		'runs'			=> 0,
		'notifications'	=> 0,
		'findCount'		=> '',
		'lastScan'		=> undef,
	})
	;

# Read scan back
$t->get_ok('/api/workspace/100/scan/1')
	->status_is(200)
	->json_is(
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessus1',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		}
	);


# workspace 100 should have our scan
$t->get_ok('/api/workspace/100/scans')
	->status_is(200)
	->json_is([
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessus1',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		}
	]);


# Workspace 101 should be empty
$t->get_ok('/api/workspace/101/scans')
	->status_is(200)
	->json_is([]);

# Cannot create duplicate in same workspace
$t->post_ok('/api/workspace/100/scans',
	json => {
		'name' 			=> 'nessus1',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost'
	})
	->status_is(400)
	->json_is('/status','Error')
	->json_has('/message')
	;

# Can create duplicate scan in other workspace
$t->post_ok('/api/workspace/101/scans',
	json => {
		'name' 			=> 'nessus1',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost'
	})
	->status_is(200)
	->json_is(
		{
			'id'			=> 2,
			'workspace'		=> 101,
			'name' 			=> 'nessus1',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		}
	)
	;

# Can create second scan
$t->post_ok('/api/workspace/100/scans',
	json => {
		'name' 			=> 'nessus3',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost',
	})
	->status_is(200)
	->json_is({
		'id'			=> 3,
		'workspace'		=> 100,
		'name' 			=> 'nessus3',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost',
		'runs'			=> 0,
		'notifications'	=> 0,
		'findCount'		=> '',
		'lastScan'		=> undef,
	})
	;

# Read scan back
$t->get_ok('/api/workspace/100/scan/3')
	->status_is(200)
	->json_is(
		{
			'id'			=> 3,
			'workspace'		=> 100,
			'name' 			=> 'nessus3',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		}
	);


# Workspace1 has 2 scans
$t->get_ok('/api/workspace/100/scans')
	->status_is(200)
	->json_is([
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessus1',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
		{
			'id'			=> 3,
			'workspace'		=> 100,
			'name' 			=> 'nessus3',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
	]);

# Cannot read scans from workspace that doesn't exist
$t->get_ok('/api/workspace/103/scans')
	->status_is(200)
	->json_is([])
	;

$t->get_ok('/api/workspace/aap/scans')
	->status_is(200)
	->json_is([])
	;

# Cannot read scans without scan id (Covered by framework)
$t->get_ok('/api/workspace//scans')
	->status_is(404)
	;

# Cannot read non-existant scan
$t->get_ok('/api/workspace/100/scan/4')
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

$t->get_ok('/api/workspace/100/scan/aap')
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

# Cannot read scan from workspace1 that was created in workspace2
$t->get_ok('/api/workspace/100/scan/2')
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

# Cannot read scan without specifying the workspace id (COvered by mojo)
$t->get_ok('/api/workspace//scan/2')
	->status_is(404)
	;

# Cannot read scan without specifying the scan_id (Covered by mojo)
$t->get_ok('/api/workspace/100/scan/')
	->status_is(404)
	;

# Cannot create scan without specifying workspace (Covered by mojo)
$t->post_ok('/api/workspace//scans',
	json => {
		'name' 			=> 'nessus3',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost',
	})
	->status_is(404)
	;

# Cannot create scan in non-existant workspace
$t->post_ok('/api/workspace/103/scans',
	json => {
		'name' 			=> 'nessus4',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

# Cannot create scan with missing name
$t->post_ok('/api/workspace/100/scans',
	json => {
#		'name' 			=> 'nessus4',
		'scanner'		=> 'Nessus6',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

# Cannot create scan wiht missing scanner
$t->post_ok('/api/workspace/100/scans',
	json => {
		'name' 			=> 'nessus4',
		'parameters'	=> 'params',
		'password'		=> 'password',
		'targets'		=> 'localhost',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;
# Cannot create scan with missing parameters
$t->post_ok('/api/workspace/100/scans',
	json => {
		'name' 			=> 'nessus4',
		'scanner'		=> 'Nessus6',
		'password'		=> 'password',
		'targets'		=> 'localhost',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

# Can update name, scanner, parameters, targets
$t->put_ok('/api/workspace/100/scan/1',
	json => {
		'name' 			=> 'nessusZ',
		'scanner'		=> 'Nessus6Z',
		'parameters'	=> 'paramsZ',
		'password'		=> 'passwordZ',
		'targets'		=> 'localhostZ',
	})
	->json_is(
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		}
	)
	;

$t->get_ok('/api/workspace/100/scans')
	->status_is(200)
	->json_is([
		{
			'id'			=> 3,
			'workspace'		=> 100,
			'name' 			=> 'nessus3',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
	]);

# Cannot update runs, notifications, findCount, lastScan
$t->put_ok('/api/workspace/100/scan/1',
	json => {
		'name' 			=> 'nessusZ',
		'scanner'		=> 'Nessus6Z',
		'parameters'	=> 'paramsZ',
		'password'		=> 'passwordZ',
		'targets'		=> 'localhostZ',
		'runs'			=> 1,
		'notifications'	=> 1,
		'findCount'		=> 1,
		'lastScan'		=> '20170101000000',
	})
	->json_is(
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		}
	)
	;

$t->get_ok('/api/workspace/100/scans')
	->status_is(200)
	->json_is([
		{
			'id'			=> 3,
			'workspace'		=> 100,
			'name' 			=> 'nessus3',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
	]);

# Cannot update id
$t->put_ok('/api/workspace/100/scan/1',
	json => {
		'id'			=> 99,
		'name' 			=> 'nessusZ',
		'scanner'		=> 'Nessus6Z',
		'parameters'	=> 'paramsZ',
		'password'		=> 'passwordZ',
		'targets'		=> 'localhostZ',
		'runs'			=> 1,
		'notifications'	=> 1,
		'findCount'		=> 1,
		'lastScan'		=> '20170101000000',
	})
	->json_is(
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		}
	)
	;

$t->get_ok('/api/workspace/100/scans')
	->status_is(200)
	->json_is([
		{
			'id'			=> 3,
			'workspace'		=> 100,
			'name' 			=> 'nessus3',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
	])
	;

$t->get_ok('/api/workspace/100/scan/99')
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

# Cannot update workspace
$t->put_ok('/api/workspace/100/scan/1',
	json => {
		'workspace'		=> 101,
		'name' 			=> 'nessusZ',
		'scanner'		=> 'Nessus6Z',
		'parameters'	=> 'paramsZ',
		'password'		=> 'passwordZ',
		'targets'		=> 'localhostZ',
		'runs'			=> 1,
		'notifications'	=> 1,
		'findCount'		=> 1,
		'lastScan'		=> '20170101000000',
	})
	->json_is(
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		}
	)
	;

$t->get_ok('/api/workspace/100/scans')
	->status_is(200)
	->json_is([
		{
			'id'			=> 3,
			'workspace'		=> 100,
			'name' 			=> 'nessus3',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
	]);

$t->get_ok('/api/workspace/101/scan/1')
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

# Cannot rename scan to an existing name
$t->put_ok('/api/workspace/100/scan/1',
	json => {
		'name' 			=> 'nessus3',
		'scanner'		=> 'Nessus6Z',
		'parameters'	=> 'paramsZ',
		'password'		=> 'passwordZ',
		'targets'		=> 'localhostZ',
		'runs'			=> 1,
		'notifications'	=> 1,
		'findCount'		=> 1,
		'lastScan'		=> '20170101000000',
	})
	->status_is(400)
	->json_is('/status', 'Error')
	->json_has('/message', '')
	;

$t->get_ok('/api/workspace/100/scans')
	->status_is(200)
	->json_is([
		{
			'id'			=> 3,
			'workspace'		=> 100,
			'name' 			=> 'nessus3',
			'scanner'		=> 'Nessus6',
			'parameters'	=> 'params',
			'password'		=> 'password',
			'targets'		=> 'localhost',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
		{
			'id'			=> 1,
			'workspace'		=> 100,
			'name' 			=> 'nessusZ',
			'scanner'		=> 'Nessus6Z',
			'parameters'	=> 'paramsZ',
			'password'		=> 'passwordZ',
			'targets'		=> 'localhostZ',
			'runs'			=> 0,
			'notifications'	=> 0,
			'findCount'		=> '',
			'lastScan'		=> undef,
		},
	]);

done_testing();
