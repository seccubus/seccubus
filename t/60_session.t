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

use lib "lib";

my $db_version = 0;
foreach my $data_file (<db/data_v*.mysql>) {
    $data_file =~ /^db\/data_v(\d+)\.mysql$/;
    $db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -uroot -e "drop database seccubus"`;
is($?,0,"Database dropped ok");
`mysql -uroot -e "create database seccubus"`;
is($?,0,"Database created ok");
`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
is($?,0,"Privileges granted ok");
`mysql -uroot -e "flush privileges;"`;
is($?,0,"Privileges flushed ok");
`mysql -uroot seccubus < db/structure_v$db_version.mysql`;
is($?,0,"Database structure created ok");
`mysql -uroot seccubus < db/data_v$db_version.mysql`;
is($?,0,"Database data imported ok");

my $t = Test::Mojo->new('Seccubus');

# Should be able to get these without authentication
$t->get_ok('/api/appstatus')
    ->status_is(200)
;

$t->get_ok('/api/session')
    ->status_is(200)
    ->json_is({
        isAdmin     => 0,
        message     => "Undefined user 'Not logged in'",
        username    => "",
        valid       => 0
    })
;
# Results in 500 because of auth failure
$t->get_ok('/api/appstatus/500')
    ->status_is(200)
;

$t->get_ok('/api/logout')
    ->status_is(200)
;

$t->delete_ok('/api/session')
    ->status_is(200)
;

$t->delete_ok('/api/session/1')
    ->status_is(200)
;

$t->get_ok('/api/workspaces')
    ->status_is(403)
;

$t->get_ok('/api/events')
    ->status_is(403)
;

# Logging in with user and invalid password
$t->post_ok('/api/session', json => { username => "admin", password => "admin" })
    ->status_is(401)
    ->json_is("/status", "Error")
    ->json_has("/message")
;

$t->get_ok('/api/workspaces')
    ->status_is(403)
;

$t->get_ok('/api/events')
    ->status_is(403)
;

# Logging in with user and valid password
$t->post_ok('/api/session', json => { username => "admin", password => "GiveMeVulns!" })
    ->status_is(200)
    ->json_is("/status", "Success")
    ->json_has("/message")
;

$t->get_ok('/api/session')
    ->status_is(200)
    ->json_is({
        isAdmin     => 1,
        message     => "Valid user 'Builtin administrator account' (admin)",
        username    => "admin",
        valid       => 1
    })
;

$t->get_ok('/api/workspaces')
    ->status_is(200)
;

$t->get_ok('/api/events')
    ->status_is(200)
;

# logging out via get request
$t->get_ok('/api/logout')
    ->status_is(200)
;

$t->get_ok('/api/workspaces')
    ->status_is(403)
;

$t->get_ok('/api/events')
    ->status_is(403)
;

# Logging in with a header
$t->post_ok('/api/session', { 'REMOTEUSER' => 'importer' } => json => {})
    ->status_is(200)
    ->json_is("/status", "Success")
    ->json_has("/message")
;

$t->get_ok('/api/session')
    ->status_is(200)
    ->json_is({
        isAdmin     => 1,
        message     => "Valid user 'Builtin importer utility account' (importer)",
        username    => "importer",
        valid       => 1
    })
;

$t->get_ok('/api/workspaces')
    ->status_is(200)
;

$t->get_ok('/api/events')
    ->status_is(200)
;

# logging out via delete request
$t->delete_ok('/api/session')
    ->status_is(200)
;

$t->get_ok('/api/workspaces')
    ->status_is(403)
;

$t->get_ok('/api/events')
    ->status_is(403)
;

$t->get_ok('/api/session')
    ->status_is(200)
    ->json_is({
        isAdmin     => 0,
        message     => "Undefined user 'Not logged in'",
        username    => "",
        valid       => 0
    })
;

# No login, just a header
$t->get_ok('/api/session' => { 'REMOTEUSER' => 'system' })
    ->status_is(200)
    ->json_is({
        isAdmin     => 1,
        message     => "Valid user 'Builtin system user' (system)",
        username    => "system",
        valid       => 1
    })
;


$t->get_ok('/api/workspaces' => { 'REMOTEUSER' => 'system' })
    ->status_is(200)
;

$t->get_ok('/api/events', { 'REMOTEUSER' => 'system' })
    ->status_is(200)
;

# No header no access

$t->get_ok('/api/workspaces')
    ->status_is(403)
;

$t->get_ok('/api/events')
    ->status_is(403)
;

$t->get_ok('/api/session')
    ->status_is(200)
    ->json_is({
        isAdmin     => 0,
        message     => "Undefined user 'Not logged in'",
        username    => "",
        valid       => 0
    })
;

done_testing();
