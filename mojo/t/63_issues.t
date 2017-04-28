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

pass("Importing ssllabs-seccubus scan");
`bin/load_ivil -w findings -s seccubus -t 20170101000000 --scanner SSLlabs testdata/ssllabs-seccubus.ivil.xml`;
is($?,0,"Import ran ok");

# Invalid workspace
$t->post_ok('/workspace/a/issues',
    json => {
        "description"=> "This is a test",
        "ext_ref"=> "test-123",
        "findings"=> [1,2,3],
        "name"=> "bla",
        "severity"=> "0",
        "status"=> "1",
      })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;
$t->get_ok('/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

$t->post_ok('/workspace/1000/issues',
    json => {
        "description"=> "This is a test",
        "ext_ref"=> "test-123",
        "findings"=> [1,2,3],
        "name"=> "bla",
        "severity"=> "0",
        "status"=> "1",
      })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;
$t->get_ok('/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

# Missing name
$t->post_ok('/workspace/100/issues',
    json => {
        "description"=> "This is a test",
        "ext_ref"=> "test-123",
        "findings"=> [1,2,3],
#        "name"=> "bla",
        "severity"=> "0",
        "status"=> "1",
      })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;
$t->get_ok('/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

# Invaid status
$t->post_ok('/workspace/100/issues',
    json => {
        "description"=> "This is a test",
        "ext_ref"=> "test-123",
        "findings"=> [1,2,3],
        "name"=> "bla",
        "severity"=> "0",
        "status"=> "99",
      })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;
$t->get_ok('/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

# Invalid severity
$t->post_ok('/workspace/100/issues',
    json => {
        "description"=> "This is a test",
        "ext_ref"=> "test-123",
        "findings"=> [1,2,3],
        "name"=> "bla",
        "severity"=> "99",
        "status"=> "1",
      })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;
$t->get_ok('/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

# Created issue without findings
$t->post_ok('/workspace/100/issues',
    json => {
        "description"=> "This is a test",
        "ext_ref"=> "test-123",
        "name"=> "bla",
        "severity"=> "0",
        "status"=> "1",
      })
    ->status_is(200)
    ->json_is({
        "id" => 2,
        "workspace_id" => 100,
        "description" => "This is a test",
        "ext_ref" => "test-123",
        "name" => "bla",
        "severity" => "0",
        "status" => "1",
    })
    ;
$t->get_ok('/workspace/100/issues')
    ->status_is(200)
    ->json_is([
        {
            "id" => 2,
            "description" => "This is a test",
            "ext_ref" => "test-123",
            "findings" => [],
            "name" => "bla",
            "severity" => "0",
            "severityName" => "Not set",
            "status" => "1",
            "statusName" => "Open",
            "url" => "https://jira.atlassian.com/browse/test-123"
        }
    ])
    ;

# Created issue with findings
$t->post_ok('/workspace/100/issues',
    json => {
        "description"=> "This is a test with findings",
        "ext_ref"=> "test-456",
        "findings" => [ 4, 5, 6 ],
        "name"=> "bla",
        "severity"=> "0",
        "status"=> "1",
      })
    ->status_is(200)
    ->json_is({
        "id" => 3,
        "workspace_id" => 100,
        "description" => "This is a test with findings",
        "ext_ref" => "test-456",
        "findings" => [ 4, 5, 6 ],
        "name" => "bla",
        "severity" => "0",
        "status" => "1",
    })
    ;
$t->get_ok('/workspace/100/issues')
    ->status_is(200)
    ->json_is([
        {
            "id" => 2,
            "description" => "This is a test",
            "ext_ref" => "test-123",
            "findings" => [],
            "name" => "bla",
            "severity" => "0",
            "severityName" => "Not set",
            "status" => "1",
            "statusName" => "Open",
            "url" => "https://jira.atlassian.com/browse/test-123"
        },
        {
            "description" => "This is a test with findings",
            "ext_ref" => "test-456",
            "findings" =>
            [
                {
                    "find" => "Supported compression methods : \n\n",
                    "host" => "www.seccubus.com/184.50.88.72",
                    "hostName" => undef,
                    "id" => "4",
                    "plugin" => "compressionMethods",
                    "port" => "443/tcp",
                    "remark" => undef,
                    "scanId" => "1",
                    "scanName" => "seccubus",
                    "severity" => "0",
                    "severityName" => "Not set",
                    "status" => "1",
                    "statusName" => "New"
                },
                {
                    "find" => "Errors in drown test : False\n\nTrue if errors occured while running drowntests",
                    "host" => "www.seccubus.com/184.50.88.72",
                    "hostName" => undef,
                    "id" => "5",
                    "plugin" => "drownErrors",
                    "port" => "443/tcp",
                    "remark" => undef,
                    "scanId" => "1",
                    "scanName" => "seccubus",
                    "severity" => "0",
                    "severityName" => "Not set",
                    "status" => "1",
                    "statusName" => "New"
                },
                {
                    "find" => "Not vulnerable to Drown attack\n\nSee https://drownattack.com/",
                    "host" => "www.seccubus.com/184.50.88.72",
                    "hostName" => undef,
                    "id" => "6",
                    "plugin" => "drownVulnerable",
                    "port" => "443/tcp",
                    "remark" => undef,
                    "scanId" => "1",
                    "scanName" => "seccubus",
                    "severity" => "0",
                    "severityName" => "Not set",
                    "status" => "1",
                    "statusName" => "New"
                }
            ],
            "id" => "3",
            "name" => "bla",
            "severity" => "0",
            "severityName" => "Not set",
            "status" => "1",
            "statusName" => "Open",
            "url" => "https://jira.atlassian.com/browse/test-456"
        }
    ])
    ;

done_testing();
exit;

