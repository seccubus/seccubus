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

# List empty
$t->get_ok('/api/sql')
	->status_is(200)
	->json_hasnt("/0")
	;

# Create failed
$t->post_ok('/api/sql', json => { 'name' => 'name'})
	->status_is(400)
    ->json_is('/status','Error')
	->json_has('/message')
;

$t->post_ok('/api/sql', json => { 'sql' => 'sql'})
    ->status_is(400)
    ->json_is('/status','Error')
    ->json_has('/message')
;

# Create ok
$t->post_ok('/api/sql', json => { name => 'name', sql => 'sql'})
    ->status_is(200)
    ->json_is({
        id => 1,
        name => 'name',
        sql => 'sql'
    })
;

# List one
$t->get_ok('/api/sql')
	->status_is(200)
	->json_has("/0")
	->json_is([
        {
            "id" => "1",
            "name" => "name",
            "sql" => "sql"
        }
    ]
    )
;

# Create with additional attributes
$t->post_ok('/api/sql', json => { 'name' => 'name', sql => "sql", 'bla' => 'hottentottententententoonstelling'})
	->status_is(200)
    ->json_is({
        id => 2,
        name => 'name',
        sql => 'sql'
    })
;

# List two
$t->get_ok('/api/sql')
	->status_is(200)
    ->json_is([
        {
            "id" => "1",
            "name" => "name",
            "sql" => "sql"
        },
        {
            "id" => "2",
            "name" => "name",
            "sql" => "sql"
        }
    ]
    )
;

# Rename non-existent
$t->put_ok('/api/sql/3', json => { name => 'aap', sql => 'aap'})
	->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;

# Rename ok
$t->put_ok('/api/sql/2', json => { name => 'aap', sql => 'aap'})
    ->status_is(200)
    ->json_is(
        {
            "id" => "2",
            "name" => "aap",
            "sql" => "aap"
        }
    )
;

# List two
$t->get_ok('/api/sql')
    ->status_is(200)
    ->json_is([
        {
            "id" => "2",
            "name" => "aap",
            "sql" => "aap"
        },
        {
            "id" => "1",
            "name" => "name",
            "sql" => "sql"
        }
    ]
    )
;

done_testing();
