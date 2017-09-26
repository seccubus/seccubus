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
$t->get_ok('/')
	->status_is(302)
	->header_is("location" => '/seccubus/seccubus.html')
	->header_is("X-Clacks-Overhead" => 'GNU Terry Pratchett')
	->header_is("X-Frame-Options" => "DENY")
	->header_is("x-xss-protection" => "1; 'mode=block'")
	->header_like("Server", qr/^Seccubus v\d\.\d+$/)
	->header_unlike("Server", qr/mojo/i)
	;

$t->get_ok('/seccubus/seccubus.html')
	->status_is(200)
	->content_like(qr/Copyright 2011-20\d+ Frank Breedijk/i)
	->header_is("X-Clacks-Overhead" => 'GNU Terry Pratchett')
	->header_is("X-Frame-Options" => "DENY")
	->header_is("x-xss-protection" => "1; 'mode=block'")
	->header_like("Server", qr/^Seccubus v\d\.\d+$/)
	->header_unlike("Server", qr/mojo/i)
	;

# CSRF protection
$t->post_ok('/api/session'=> { 'REMOTEUSER' => 'admin' } )
    ->status_is(500)
    ->json_is({
        status => "Error",
        message => "CSRF protection kicked in"
    })
;

$t->post_ok('/api/session'=> { 'REMOTEUSER' => 'admin', "content-type" => "application/json" } )
    ->status_is(200)
;

done_testing();
