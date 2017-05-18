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
use SeccubusScans;

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
		'name' 			=> 'workspace100',
	})
	->status_is(200)
	->json_is('/id',100)
	->json_is('/name','workspace100')
	;

# Create asset
$t->post_ok('/workspace/100/assets',
    json => {
        name => "test",
        hosts => "localhost",
        recipients => "root\@example.com"
    })
    ->status_is(200)
    ->json_is({
        id => 1,
        name => "test",
        hosts => "localhost",
        recipients => "root\@example.com",
        workspace => 100,
    })
;
pass("Setup complete");

# Invalid workspace
$t->post_ok('/workspace/a/asset/1/hosts',
    json => {
        name => "google-public-dns-a.google.com",
        ip => "8.8.8.8",
    })
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;

$t->post_ok('/workspace/101/asset/1/hosts',
    json => {
        name => "google-public-dns-a.google.com",
        ip => "8.8.8.8",
    })
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;

# Invalid scan
$t->post_ok('/workspace/100/asset/a/hosts',
    json => {
        name => "google-public-dns-a.google.com",
        ip => "8.8.8.8",
    })
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;

$t->post_ok('/workspace/100/asset/2/hosts',
    json => {
        name => "google-public-dns-a.google.com",
        ip => "8.8.8.8",
    })
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;




# Create asset host with ip
$t->post_ok('/workspace/100/asset/1/hosts',
    json => {
        host => "google-public-dns-a.google.com",
        ip => "8.8.8.8",
    })
    ->status_is(200)
    ->json_is({
        id      => 2,
        host    => "google-public-dns-a.google.com",
        ip      => "8.8.8.8",
    })
;

# Create asset host without ip
$t->post_ok('/workspace/100/asset/1/hosts',
    json => {
        host => "google-public-dns-b.google.com",
    })
    ->status_is(200)
    ->json_is({
        id      => 3,
        host    => "google-public-dns-b.google.com",
        ip      => "8.8.4.4",
    })
 ;

# Create asset host with multiple ips
$t->post_ok('/workspace/100/asset/1/hosts',
    json => {
        host => "www.seccubus.com",
    })
    ->status_is(200)
    ->json_is("/id", 4)
    ->json_is("/host", "www.seccubus.com")
    ->json_has("/ip")
;


# Get asset hosts...
# Incorrect workspace
$t->get_ok('/workspace/101/asset/1/hosts')
    ->status_is(200)
    ->json_is([])
;

$t->get_ok('/workspace/a/asset/1/hosts')
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;

$t->get_ok('/workspace/100/asset/101/hosts')
    ->status_is(200)
    ->status_is(200)
;

$t->get_ok('/workspace/100/asset/a/hosts')
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;

# Correct
$t->get_ok('/workspace/100/asset/1/hosts')
    ->status_is(200)
    ->json_is("/0",{
        "host"=> "localhost",
        "id"=> "1",
        "ip"=> "127.0.0.1"
    })
    ->json_is("/1",{
        "host"=> "google-public-dns-a.google.com",
        "id"=> "2",
        "ip"=> "8.8.8.8"
    })
    ->json_is("/2",{
            "host"=> "google-public-dns-b.google.com",
            "id"=> "3",
            "ip"=> "8.8.4.4"
    })
    ->json_is("/3/host","www.seccubus.com")
    ->json_is("/3/id","4")
    ->json_has("/3/ip")
    ->json_hasnt("/4")
;

# Updating
# Invalid workspace
$t->put_ok('/workspace/101/asset/1/host/4', json => { host => "seccubus.com", ip => "1.2.3.4" } )
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
$t->put_ok('/workspace/a/asset/1/host/4', json => { host => "seccubus.com", ip => "1.2.3.4" } )
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
# INvalid asset
$t->put_ok('/workspace/100/asset/101/host/4', json => { host => "seccubus.com", ip => "1.2.3.4" } )
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
$t->put_ok('/workspace/100/asset/a/host/4', json => { host => "seccubus.com", ip => "1.2.3.4" } )
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
# Invalid ID
$t->put_ok('/workspace/100/asset/1/host/401', json => { host => "seccubus.com", ip => "1.2.3.4" } )
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
$t->put_ok('/workspace/100/asset/1/host/a', json => { host => "seccubus.com", ip => "1.2.3.4" } )
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
# No ip and host
$t->put_ok('/workspace/100/asset/1/host/4', json => { host => "", ip => "" } )
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;

# Valid
$t->put_ok('/workspace/100/asset/1/host/4', json => { host => "seccubus.com", ip => "1.2.3.4" } )
    ->status_is(200)
    ->json_is({
        id => 4,
        host => "seccubus.com",
        ip => "1.2.3.4",
    })
;

$t->get_ok('/workspace/100/asset/1/hosts')
    ->status_is(200)
    ->json_is("/0",{
        "host"=> "localhost",
        "id"=> "1",
        "ip"=> "127.0.0.1"
    })
    ->json_is("/1",{
        "host"=> "google-public-dns-a.google.com",
        "id"=> "2",
        "ip"=> "8.8.8.8"
    })
    ->json_is("/2",{
            "host"=> "google-public-dns-b.google.com",
            "id"=> "3",
            "ip"=> "8.8.4.4"
    })
    ->json_is("/3/host","seccubus.com")
    ->json_is("/3/id","4")
    ->json_is("/3/ip","1.2.3.4")
    ->json_hasnt("/4")
;

# Host only
$t->put_ok('/workspace/100/asset/1/host/4', json => { host => "seccubus.com", ip => "" } )
    ->status_is(200)
    ->json_is("/id", 4)
    ->json_is("/host","seccubus.com")
    ->json_has("/ip")
;

$t->get_ok('/workspace/100/asset/1/hosts')
    ->status_is(200)
    ->json_is("/0",{
        "host"=> "localhost",
        "id"=> "1",
        "ip"=> "127.0.0.1"
    })
    ->json_is("/1",{
        "host"=> "google-public-dns-a.google.com",
        "id"=> "2",
        "ip"=> "8.8.8.8"
    })
    ->json_is("/2",{
            "host"=> "google-public-dns-b.google.com",
            "id"=> "3",
            "ip"=> "8.8.4.4"
    })
    ->json_is("/3/host","seccubus.com")
    ->json_is("/3/id","4")
    ->json_has("/3/ip")
    ->json_hasnt("/4")
;

# IP only
$t->put_ok('/workspace/100/asset/1/host/4', json => { host => "", ip => "1.2.3.4" } )
    ->status_is(200)
    ->json_is("/id", 4)
    ->json_is("/host","")
    ->json_is("/ip","1.2.3.4")
;

$t->get_ok('/workspace/100/asset/1/hosts')
    ->status_is(200)
    ->json_is("/0",{
        "host"=> "localhost",
        "id"=> "1",
        "ip"=> "127.0.0.1"
    })
    ->json_is("/1",{
        "host"=> "google-public-dns-a.google.com",
        "id"=> "2",
        "ip"=> "8.8.8.8"
    })
    ->json_is("/2",{
            "host"=> "google-public-dns-b.google.com",
            "id"=> "3",
            "ip"=> "8.8.4.4"
    })
    ->json_is("/3/host","")
    ->json_is("/3/id","4")
    ->json_is("/3/ip","1.2.3.4")
    ->json_hasnt("/4")
;

# Delete
# Invalid workspace
$t->delete_ok("/workspace/101/asset/1/host/4")
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
$t->delete_ok("/workspace/a/asset/1/host/4")
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
# Invalid asset
$t->delete_ok("/workspace/100/asset/101/host/4")
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
$t->delete_ok("/workspace/100/asset/a/host/4")
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
# Invalid host
$t->delete_ok("/workspace/100/asset/1/host/401")
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;
$t->delete_ok("/workspace/100/asset/1/host/a")
    ->status_is(400)
    ->json_is("/status","Error")
    ->json_has("/message")
;

# OK
$t->delete_ok("/workspace/100/asset/1/host/4")
    ->status_is(200)
    ->json_is({id=>4})
;

$t->get_ok('/workspace/100/asset/1/hosts')
    ->status_is(200)
    ->json_is("/0",{
        "host"=> "localhost",
        "id"=> "1",
        "ip"=> "127.0.0.1"
    })
    ->json_is("/1",{
        "host"=> "google-public-dns-a.google.com",
        "id"=> "2",
        "ip"=> "8.8.8.8"
    })
    ->json_is("/2",{
            "host"=> "google-public-dns-b.google.com",
            "id"=> "3",
            "ip"=> "8.8.4.4"
    })
    ->json_hasnt("/3")
;


done_testing();
exit;

