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
use SeccubusIVIL;
use SeccubusRuns;

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
my ( $workspace_id, $scan_id, $run_id) = load_ivil("../testdata/delta-AAAAAAA.ivil.xml","Nessus6",6,"20170101000001","workspace1","scan1");
is($workspace_id,100,"Workspace id is ok");
is($scan_id,1,"Scan id is ok");
is($run_id,1,"Run id is ok");
my $run_id2 = update_run($workspace_id,$scan_id,"20170101000001","../testdata/delta-AAAAAAA.ivil.xml","XML");
is($run_id2,$run_id,"Run id ok");
($workspace_id, $scan_id, $run_id) = load_ivil("../testdata/delta-AAAAAAA.ivil.xml","Nessus6",6,"20170101000002","workspace1","scan1");
is($workspace_id,100,"Workspace id is ok");
is($scan_id,1,"Scan id is ok");
is($run_id,2,"Run id is ok");
($workspace_id, $scan_id, $run_id) = load_ivil("../testdata/delta-AAAAAAA.ivil.xml","Nessus6",6,"20170101000002","workspace1","scan2");
is($workspace_id,100,"Workspace id is ok");
is($scan_id,2,"Scan id is ok");
is($run_id,3,"Run id is ok");
$run_id2 = update_run($workspace_id,$scan_id,"20170101000002","../testdata/delta-AAAAAAA.ivil.xml","XML");
is($run_id2,$run_id,"Run id ok");
$run_id2 = update_run($workspace_id,$scan_id,"20170101000002","../testdata/delta-AAAAAAA.nbe","NBE");
is($run_id2,$run_id,"Run id ok");
($workspace_id, $scan_id, $run_id) = load_ivil("../testdata/delta-AAAAAAA.ivil.xml","Nessus6",6,"20170101000003","workspace1","scan3");
is($workspace_id,100,"Workspace id is ok");
is($scan_id,3,"Scan id is ok");
is($run_id,4,"Run id is ok");

# Can read runs
$t->get_ok('/workspace/100/scan/1/runs')
	->status_is(200)
	->json_is(
		[
			{
				"attachments" => [],
				"id" => "2",
				"time" => "2017-01-01 00:00:02"
			},
			{
				"attachments" => [
					{
						"description" => "XML",
						"id" => "1",
						"name" => "delta-AAAAAAA.ivil.xml"
					}
				],
				"id" => "1",
				"time" => "2017-01-01 00:00:01"
			}
		]
	)
	;

$t->get_ok('/workspace/100/scan/2/runs')
	->status_is(200)
	->json_is(
		[
			{
				"attachments" => [
					{
						"description" => "XML",
						"id" => "2",
						"name" => "delta-AAAAAAA.ivil.xml"
					},{
						"description" => "NBE",
						"id" => "3",
						"name" => "delta-AAAAAAA.nbe"
					}
				],
				"id" => "3",
				"time" => "2017-01-01 00:00:02"
			}
		]
	)
	;

$t->get_ok('/workspace/100/scan/3/runs')
	->status_is(200)
	->json_is(
		[
			{
				"attachments" => [],
				"id" => "4",
				"time" => "2017-01-01 00:00:03"
			}
		]
	)
	;

# Cannot get runs from a non-existing scan
$t->get_ok('/workspace/101/scan/1/runs')
	->status_is(200)
	->json_is([]])
	;

# Cannot get runs from from a non-existing scan
$t->get_ok('/workspace/100/scan/4/runs')
	->status_is(200)
	->json_is([]])
	;


done_testing();
exit;

