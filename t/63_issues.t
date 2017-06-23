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
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin', "content-type" => "application/json" })
    ->status_is(200,"Login ok")
;

pass("Importing ssllabs-seccubus scan");
`bin/load_ivil -w findings -s seccubus -t 20170101000000 --scanner SSLlabs testdata/ssllabs-seccubus.ivil.xml`;
is($?,0,"Import ran ok");

# Invalid workspace
$t->post_ok('/api/workspace/a/issues',
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
$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

$t->post_ok('/api/workspace/1000/issues',
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
$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

# Missing name
$t->post_ok('/api/workspace/100/issues',
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
$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

# Invaid status
$t->post_ok('/api/workspace/100/issues',
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
$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

# Invalid severity
$t->post_ok('/api/workspace/100/issues',
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
$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([])
    ;

# Created issue without findings
$t->post_ok('/api/workspace/100/issues',
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
$t->get_ok('/api/workspace/100/issues')
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

# Cannot update invalid workspace
$t->put_ok('/api/workspace/a/issue/2',
    json => {
        "id" => 2,
        "description"=> "This is an updated test",
        "ext_ref"=> "test-123-updated",
        "name"=> "bla-updated",
        "severity"=> "1",
        "status"=> "2",
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

$t->put_ok('/api/workspace/101/issue/2',
    json => {
        "id" => 2,
        "description"=> "This is an updated test",
        "ext_ref"=> "test-123-updated",
        "name"=> "bla-updated",
        "severity"=> "1",
        "status"=> "2",
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;
sleep 1;
$t->put_ok('/api/workspace/100/issue/2',
    json => {
        "id" => 3,
        "description"=> "This is an updated test",
        "ext_ref"=> "test-123-updated",
        "name"=> "bla-updated",
        "severity"=> "1",
        "status"=> "2",
    })
    ->status_is(200)
    ->json_is({
        "id" => 2,
        "description" => "This is an updated test",
        "ext_ref" => "test-123-updated",
        "name" => "bla-updated",
        "severity" => "1",
        "severityName" => "High",
        "status" => "2",
        "statusName" => "Closed",
    })
    ;

$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([
        {
            "id" => 2,
            "description" => "This is an updated test",
            "ext_ref" => "test-123-updated",
            "findings" => [],
            "name" => "bla-updated",
            "severity" => "1",
            "severityName" => "High",
            "status" => "2",
            "statusName" => "Closed",
            "url" => "https://jira.atlassian.com/browse/test-123-updated"
        }]
    )
    ;

# Reset and create findings
sleep 1;
$t->put_ok('/api/workspace/100/issue/2',
    json => {
        "id" => 2,
        "description" => "This is a test",
        "ext_ref" => "test-123",
        "name" => "bla",
        "severity" => "0",
        "status" => "1",
        "findings_add" => [4,5,6]
    })
    ->status_is(200)
    ->json_is({
        "id" => 2,
        "description" => "This is a test",
        "ext_ref" => "test-123",
        "name" => "bla",
        "severity" => "0",
        "severityName" => "Not set",
        "status" => "1",
        "statusName" => "Open",
    })
    ;

$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([
        {
            "id" => 2,
            "description" => "This is a test",
            "ext_ref" => "test-123",
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
            "name" => "bla",
            "severity" => "0",
            "severityName" => "Not set",
            "status" => "1",
            "statusName" => "Open",
            "url" => "https://jira.atlassian.com/browse/test-123"
        }]
    )
    ;

# Reset and remove one finding
sleep 1;
$t->put_ok('/api/workspace/100/issue/2',
    json => {
        "id" => 2,
        "description" => "This is a test",
        "ext_ref" => "test-123",
        "name" => "bla",
        "severity" => "0",
        "status" => "1",
        "findings_remove" => [4]
    })
    ->status_is(200)
    ->json_is({
        "id" => 2,
        "description" => "This is a test",
        "ext_ref" => "test-123",
        "name" => "bla",
        "severity" => "0",
        "severityName" => "Not set",
        "status" => "1",
        "statusName" => "Open",
    })
    ;

$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([
        {
            "id" => 2,
            "description" => "This is a test",
            "ext_ref" => "test-123",
            "findings" =>
                [
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
            "name" => "bla",
            "severity" => "0",
            "severityName" => "Not set",
            "status" => "1",
            "statusName" => "Open",
            "url" => "https://jira.atlassian.com/browse/test-123"
        }]
    )
    ;

# Reset and remove all findings
sleep 1;
$t->put_ok('/api/workspace/100/issue/2',
    json => {
        "id" => 2,
        "description" => "This is a test",
        "ext_ref" => "test-123",
        "name" => "bla",
        "severity" => "0",
        "status" => "1",
        "findings_remove" => [5,6]
    })
    ->status_is(200)
    ->json_is({
        "id" => 2,
        "description" => "This is a test",
        "ext_ref" => "test-123",
        "name" => "bla",
        "severity" => "0",
        "severityName" => "Not set",
        "status" => "1",
        "statusName" => "Open",
    })
    ;

$t->get_ok('/api/workspace/100/issues')
    ->status_is(200)
    ->json_is([
        {
            "id" => 2,
            "description" => "This is a test",
            "ext_ref" => "test-123",
            "findings" =>
                [],
            "name" => "bla",
            "severity" => "0",
            "severityName" => "Not set",
            "status" => "1",
            "statusName" => "Open",
            "url" => "https://jira.atlassian.com/browse/test-123"
        }]
    )
    ;

# Created issue with findings
$t->post_ok('/api/workspace/100/issues',
    json => {
        "description"=> "This is a test with findings",
        "ext_ref"=> "test-456",
        "findings_add" => [ 4, 5, 6 ],
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
        "name" => "bla",
        "severity" => "0",
        "status" => "1",
    })
    ;
$t->get_ok('/api/workspace/100/issues')
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

# Get findings for a specific issue
$t->get_ok('/api/workspace/100/findings?Issue=3')
    ->status_is(200)
    ->json_is([
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
            "statusName" => "New",
            "issues" => [
                {
                    "description" => "This is a test with findings",
                    "ext_ref" => "test-456",
                    "id" => "3",
                    "name" => "bla",
                    "severity" => "0",
                    "severityName" => "Not set",
                    "status" => "1",
                    "statusName" => "Open",
                    "url" => "https://jira.atlassian.com/browse/test-456"
                }
            ]
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
            "statusName" => "New",
            "issues" => [
                {
                    "description" => "This is a test with findings",
                    "ext_ref" => "test-456",
                    "id" => "3",
                    "name" => "bla",
                    "severity" => "0",
                    "severityName" => "Not set",
                    "status" => "1",
                    "statusName" => "Open",
                    "url" => "https://jira.atlassian.com/browse/test-456"
                }
            ]
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
            "statusName" => "New",
            "issues" => [
                {
                    "description" => "This is a test with findings",
                    "ext_ref" => "test-456",
                    "id" => "3",
                    "name" => "bla",
                    "severity" => "0",
                    "severityName" => "Not set",
                    "status" => "1",
                    "statusName" => "Open",
                    "url" => "https://jira.atlassian.com/browse/test-456"
                }
            ]
        }
    ])
    ;

$t->get_ok('/api/workspace/100/findings?Issue=2')
    ->status_is(200)
    ->json_is([])
    ;

# Issue History
# Invalid workspace
$t->get_ok('/api/workspace/a/issue/2/history')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# Invalid issue
$t->get_ok('/api/workspace/100/issue/a/history')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# Invalid combination
$t->get_ok('/api/workspace/101/issue/2/history')
    ->status_is(200)
    ->json_is([])
    ;

# Invalid combination
$t->get_ok('/api/workspace/100/issue/1/history')
    ->status_is(200)
    ->json_is([])
    ;

# OK
$t->get_ok('/api/workspace/100/issue/2/history')
    ->status_is(200)
    ->json_has('/0')
    ->json_has('/1')
    ->json_has('/2')
    ->json_hasnt('/3')
    ->json_is('/0/description', "This is a test",)
    ->json_is('/0/ext_ref', "test-123",)
    ->json_is('/0/id', "3",)
    ->json_is('/0/issueId', "2",)
    ->json_is('/0/name', "bla",)
    ->json_is('/0/severity', "0",)
    ->json_is('/0/severityName', "Not set",)
    ->json_is('/0/status', "1",)
    ->json_is('/0/statusName', "Open",)
    ->json_is('/0/userId', "1",)
    ->json_is('/0/userName', "admin")
    ->json_has('/0/timestamp')
    ->json_is('/1/description', "This is an updated test",)
    ->json_is('/1/ext_ref', "test-123-updated",)
    ->json_is('/1/id', "2",)
    ->json_is('/1/issueId', "2",)
    ->json_is('/1/name', "bla-updated",)
    ->json_is('/1/severity', "1",)
    ->json_is('/1/severityName', "High",)
    ->json_is('/1/status', "2",)
    ->json_is('/1/statusName', "Closed",)
    ->json_is('/1/userId', "1",)
    ->json_is('/1/userName', "admin")
    ->json_has('/1/timestamp')
    ->json_is('/2/description', "This is a test",)
    ->json_is('/2/ext_ref', "test-123",)
    ->json_is('/2/id', "1",)
    ->json_is('/2/issueId', "2",)
    ->json_is('/2/name', "bla",)
    ->json_is('/2/severity', "0",)
    ->json_is('/2/severityName', "Not set",)
    ->json_is('/2/status', "1",)
    ->json_is('/2/statusName', "Open",)
    ->json_is('/2/userId', "1",)
    ->json_is('/2/userName', "admin")
    ->json_has('/2/timestamp')
    ;

$t->get_ok('/api/workspace/100/issue/3/history')
    ->status_is(200)
    ->json_has('/0')
    ->json_hasnt('/1')
    ->json_is('/0/description', "This is a test with findings",)
    ->json_is('/0/ext_ref', "test-456",)
    ->json_is('/0/id', "4",)
    ->json_is('/0/issueId', "3",)
    ->json_is('/0/name', "bla",)
    ->json_is('/0/severity', "0",)
    ->json_is('/0/severityName', "Not set",)
    ->json_is('/0/status', "1",)
    ->json_is('/0/statusName', "Open",)
    ->json_is('/0/userId', "1",)
    ->json_is('/0/userName', "admin")
    ->json_has('/0/timestamp')
    ;

done_testing();
exit;

