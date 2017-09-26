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
`mysql -h 127.0.0.1 -u root -e "drop database seccubus"`;
`mysql -h 127.0.0.1 -u root -e "create database seccubus"`;
`mysql -h 127.0.0.1 -u root -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
`mysql -h 127.0.0.1 -u root -e "flush privileges;"`;
`mysql -h 127.0.0.1 -u root seccubus < db/structure_v$db_version.mysql`;
`mysql -h 127.0.0.1 -u root seccubus < db/data_v$db_version.mysql`;

my $t = Test::Mojo->new('Seccubus');

# Log in
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin', "content-type" => "application/json" })
    ->status_is(200,"Login ok")
;

# List empty
$t->get_ok('/api/workspaces')
	->status_is(200)
	->json_hasnt("/0")
	;

# Create
$t->post_ok('/api/workspaces', json => { 'name' => 'workspace1'})
	->status_is(200)
	->json_is('/name','workspace1')
	->json_is('/id',100)
	;
# List one
$t->get_ok('/api/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',100)
	->json_is('/0/name','workspace1')
	->json_hasnt('/1')
	;

# Create duplicate
$t->post_ok('/api/workspaces', json => { 'name' => 'workspace1'})
	->status_is(400)
	;

# List one
$t->get_ok('/api/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',100)
	->json_is('/0/name','workspace1')
	->json_hasnt('/1')
	;

# Create without name
$t->post_ok('/api/workspaces', json => { 'names' => 'workspace2'})
	->status_is(400)
	;

# List one
$t->get_ok('/api/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',100)
	->json_is('/0/name','workspace1')
	->json_hasnt('/1')
	;

# Create with additional attributes
$t->post_ok('/api/workspaces', json => { 'name' => 'workspace2', 'bla' => 'hottentottententententoonstelling'})
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','workspace2')
	->json_hasnt('/bla')
	;

# List two
$t->get_ok('/api/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',100)
	->json_is('/0/name','workspace1')
	->json_has("/1")
	->json_is('/1/id',101)
	->json_is('/1/name','workspace2')
	->json_hasnt('/2')
	;

# Rename non-existent workspace
$t->put_ok('/api/workspace/102', json => { name => 'aap'})
	->status_is(400)
	;

# Rename to duplibate name
$t->put_ok('/api/workspace/101', json => { name => 'workspace1'})
	->status_is(400)
	;

# Rename ok
$t->put_ok('/api/workspace/101', json => { name => 'aap'})
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','aap')
	->json_hasnt('/bla')
	;

# List two
$t->get_ok('/api/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',101)
	->json_is('/0/name','aap')
	->json_has("/1")
	->json_is('/1/id',100)
	->json_is('/1/name','workspace1')
	->json_hasnt('/2')
	;

# Rename additional attributes
$t->put_ok('/api/workspace/101', json => { name => 'aap2', "bla" => "hottentottententententoonstelling"})
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','aap2')
	->json_hasnt('/bla')
	;

# List two
$t->get_ok('/api/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',101)
	->json_is('/0/name','aap2')
	->json_has("/1")
	->json_is('/1/id',100)
	->json_is('/1/name','workspace1')
	->json_hasnt('/2')
	;

# Rename to current name
$t->put_ok('/api/workspace/101', json => { name => 'aap2' })
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','aap2')
	->json_hasnt('/bla')
	;

# List two
$t->get_ok('/api/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',101)
	->json_is('/0/name','aap2')
	->json_has("/1")
	->json_is('/1/id',100)
	->json_is('/1/name','workspace1')
	->json_hasnt('/2')
	;

done_testing();
