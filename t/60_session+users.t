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
foreach my $data_file (glob "db/data_v*.mysql") {
    $data_file =~ /^db\/data_v(\d+)\.mysql$/;
    $db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -h 127.0.0.1 -u root -e "drop database seccubus"`;
is($?,0,"Database dropped ok");
`mysql -h 127.0.0.1 -u root -e "create database seccubus"`;
is($?,0,"Database created ok");
`mysql -h 127.0.0.1 -u root -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
is($?,0,"Privileges granted ok");
`mysql -h 127.0.0.1 -u root -e "flush privileges;"`;
is($?,0,"Privileges flushed ok");
`mysql -h 127.0.0.1 -u root seccubus < db/structure_v$db_version.mysql`;
is($?,0,"Database structure created ok");
`mysql -h 127.0.0.1 -u root seccubus < db/data_v$db_version.mysql`;
is($?,0,"Database data imported ok");

my $t = Test::Mojo->new('Seccubus');

# Should be able to get these without authentication
$t->get_ok('/api/appstatus')
    ->status_is(200)
;

$t->get_ok('/api/session' => { "content-type" => "application/json" })
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

$t->delete_ok('/api/session' => { "content-type" => "application/json" })
    ->status_is(200)
;

$t->delete_ok('/api/session/1' => { "content-type" => "application/json" })
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
$t->delete_ok('/api/session' => { "content-type" => "application/json" })
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

# Get user list
$t->get_ok('/api/users' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200)
    ->json_is([
        {
            id          => 1,
            username    => "admin",
            name        => "Builtin administrator account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 3,
            username    => "importer",
            name        => "Builtin importer utility account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 2,
            username    => "system",
            name        => "Builtin system user",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
    ])
;

$t->get_ok('/api/session' => { 'REMOTEUSER' => 'seccubus' })
    ->status_is(200)
    ->json_is({
        isAdmin     => 1,
        message     => "Valid user 'User created by JIT provisioning' (seccubus)",
        username    => "seccubus",
        valid       => 1
    })
;

# Get user list
$t->get_ok('/api/users' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200)
    ->json_is([
       {
            id          => 1,
            username    => "admin",
            name        => "Builtin administrator account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 3,
            username    => "importer",
            name        => "Builtin importer utility account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 100,
            username    => "seccubus",
            name        => "User created by JIT provisioning",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 2,
            username    => "system",
            name        => "Builtin system user",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
    ])
;

$t->post_ok('/api/session' => { 'REMOTEUSER' => 'seccubus2', "content-type" => "application/json" })
    ->status_is(200)
    ->json_is({
        isAdmin     => 1,
        message     => "You are now logged in as seccubus2",
        password    => "",
        status      => "Success",
    })
;

# Get user list
$t->get_ok('/api/users' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200)
    ->json_is([
        {
            id          => 1,
            username    => "admin",
            name        => "Builtin administrator account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 3,
            username    => "importer",
            name        => "Builtin importer utility account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 100,
            username    => "seccubus",
            name        => "User created by JIT provisioning",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 101,
            username    => "seccubus2",
            name        => "User created by JIT provisioning",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 2,
            username    => "system",
            name        => "Builtin system user",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
    ])
;

# Manually adding a user
`bin/add_user  -n "Third seccubus user" --isadmin`;
isnt($?,0,"Adduser fails without username");

`bin/add_user -u seccubus3 -n "Third seccubus user (admin)" --isadmin`;
is($?,0,"Command executed ok");

# SHould be able to log in seccubus 3
$t->get_ok('/api/session' => { 'REMOTEUSER' => 'seccubus3' })
    ->status_is(200)
    ->json_is({
        isAdmin     => 1,
        message     => "Valid user 'Third seccubus user (admin)' (seccubus3)",
        username    => "seccubus3",
        valid       => 1
    })
;

# Get user list
$t->get_ok('/api/users' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200)
    ->json_is([
        {
            id          => 1,
            username    => "admin",
            name        => "Builtin administrator account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 3,
            username    => "importer",
            name        => "Builtin importer utility account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 100,
            username    => "seccubus",
            name        => "User created by JIT provisioning",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 101,
            username    => "seccubus2",
            name        => "User created by JIT provisioning",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 102,
            username    => "seccubus3",
            name        => "Third seccubus user (admin)",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 2,
            username    => "system",
            name        => "Builtin system user",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
    ])
;

`bin/add_user -u seccubus3 -n "Third seccubus user (admin)" --isadmin`;
isnt($?,0,"Cannot add duplicate user");

# Adding non admin user
`bin/add_user -u seccubus4 -n "Fourth seccubus user (not an admin)"`;
is($?,0,"Command executed ok");

# SHould be able to log in seccubus 3
$t->get_ok('/api/session' => { 'REMOTEUSER' => 'seccubus4' })
    ->status_is(200)
    ->json_is({
        isAdmin     => 0,
        message     => "Valid user 'Fourth seccubus user (not an admin)' (seccubus4)",
        username    => "seccubus4",
        valid       => 1
    })
;

# Get user list
$t->get_ok('/api/users' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200)
    ->json_is([
        {
            id          => 1,
            username    => "admin",
            name        => "Builtin administrator account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 3,
            username    => "importer",
            name        => "Builtin importer utility account",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 100,
            username    => "seccubus",
            name        => "User created by JIT provisioning",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 101,
            username    => "seccubus2",
            name        => "User created by JIT provisioning",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 102,
            username    => "seccubus3",
            name        => "Third seccubus user (admin)",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 103,
            username    => "seccubus4",
            name        => "Fourth seccubus user (not an admin)",
            groups      => [
                { id => 2, name => "ALL" },
            ]
        },
        {
            id          => 2,
            username    => "system",
            name        => "Builtin system user",
            groups      => [
                { id => 1, name => "ADMINISTRATORS" },
                { id => 2, name => "ALL" },
            ]
        },
    ])
;
done_testing();
