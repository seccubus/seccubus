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

use SeccubusV2;
use SeccubusUsers;

use lib "lib";

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

# Let's set things up
pass("Setting up");
add_user("test", "Test user", 0);
add_user("testadm", "Test admin", 1);

# Can get session without auth
$t->get_ok('/session')
	->status_is(200)
	->json_is(
        {

            "isadmin" =>  1,
            "message" =>  "Running from command line as admin",
            "username" =>  "admin",
            "valid" =>  1

        }
	)
	;

$ENV{REMOTE_ADDR} = "127.0.0.1";
$ENV{REMOTE_USER} = "admin";
$t->get_ok('/session')
    ->status_is(200)
    ->json_is(
        {

            "isadmin" =>  1,
            "message" =>  "Valid user 'Builtin administrator account' (admin)",
            "username" =>  "admin",
            "valid" =>  1

        }
    )
    ;

$ENV{REMOTE_USER} = "test";
$t->get_ok('/session')
    ->status_is(200)
    ->json_is(
        {

            "isadmin" =>  0,
            "message" =>  "Valid user 'Test user' (test)",
            "username" =>  "test",
            "valid" =>  1

        }
    )
    ;

$ENV{REMOTE_USER} = "testadm";
$t->get_ok('/session')
    ->status_is(200)
    ->json_is(
        {

            "isadmin" =>  1,
            "message" =>  "Valid user 'Test admin' (testadm)",
            "username" =>  "testadm",
            "valid" =>  1

        }
    )
    ;

$ENV{REMOTE_USER} = "invalid";
$t->get_ok('/session')
    ->status_is(200)
    ->json_is(
        {

            "isadmin" =>  0,
            "message" =>  "Undefined user 'invalid'",
            "username" =>  undef,
            "valid" =>  0

        }
    )
    ;

delete $ENV{REMOTE_ADDR};
delete $ENV{REMOTE_USER};

$t->get_ok('/session' => { RemoteUser => "test" } )
    ->status_is(200)
    ->json_is(
        {

            "isadmin" =>  0,
            "message" =>  "Valid user 'Test user' (test)",
            "username" =>  "test",
            "valid" =>  1

        }
    )
    ;

$t->get_ok('/session' => { "REMOTEUSER" => "testadm" } )
    ->status_is(200)
    ->json_is(
        {

            "isadmin" =>  1,
            "message" =>  "Valid user 'Test admin' (testadm)",
            "username" =>  "testadm",
            "valid" =>  1

        }
    )
    ;

$t->get_ok('/session' => { "REMOTEUSER" => "invalid" } )
    ->status_is(200)
    ->json_is(
        {

            "isadmin" =>  0,
            "message" =>  "Undefined user 'invalid'",
            "username" =>  undef,
            "valid" =>  0

        }
    )
    ;



done_testing();
exit;

