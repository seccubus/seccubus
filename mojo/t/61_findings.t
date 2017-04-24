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
pass("Importing ssllabs-schubergphilis scan");
`bin/load_ivil -w findings -s schubergphilis -t 20170101000100 --scanner SSLlabs testdata/ssllabs-schubergphilis.ivil.xml`;
is($?,0,"Import ran ok");
pass("Importing ssllabs-seccubus scan, again");
`bin/load_ivil -w findings -s seccubus -t 20170101000200 --scanner SSLlabs testdata/ssllabs-seccubus.ivil.xml`;
is($?,0,"Import ran ok");
pass("Importing nmap scan");
`bin/load_ivil -w findings -s nmap -t 20170101000300 --scanner NMap testdata/nmap.ivil.xml`;
is($?,0,"Import ran ok");

# Should fail with non numeric workspace
$t->get_ok('/workspace/a/findings')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

$t->get_ok('/workspace/100/findings')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},200,"200 Elements returned");

$t->get_ok('/workspace/100/findings?Limit=-1')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},324,"324 Elements returned");

# Should get no findings is scanId doesn't exist
$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=54345')
    ->status_is(200)
    ->json_is([])
    ;

$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=1')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},97,"97 Elements returned");

$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=2')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},185,"185 Elements returned");

$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=3')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},42,"42 Elements returned");

# TODO: test filters

done_testing();
