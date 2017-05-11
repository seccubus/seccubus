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
# List empty
$t->get_ok('/severities')
	->status_is(200)
	->json_is([
	    {
	        "description" => "No severity has been set",
	        "id" => "0",
	        "name" => "Not set"
	    },
	    {
	        "description" => "Direct compromise of Confidentiality, Integrity or Availbility or policy violation",
	        "id" => "1",
	        "name" => "High"
	    },
	    {
	        "description" => "Could compromise of Confidentiality, Integrity or Availbility in combination with other issue. Disclosure of sensitive information",
	        "id" => "2",
	        "name" => "Medium"
	    },
	    {
	        "description" => "Weakens security posture",
	        "id" => "3",
	        "name" => "Low"
	    },
	    {
	        "description" => "Not a security issue, but deemed noteworthy",
	        "id" => "4",
	        "name" => "Note"
	    }
	])
	;

done_testing();