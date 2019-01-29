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
use SeccubusV2;

use lib "lib";

my $db_version = 0;
foreach my $data_file (glob "db/data_v*.mysql") {
    $data_file =~ /^db\/data_v(\d+)\.mysql$/;
    $db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -h 127.0.0.1 -u root -e "drop database seccubus"`;
is($?,0,"Command executed ok");
`mysql -h 127.0.0.1 -u root -e "create database seccubus"`;
is($?,0,"Command executed ok");
`mysql -h 127.0.0.1 -u root -e "create user if not exists 'seccubus'\@'localhost' identified by 'seccubus'"`;
is($?,0,"Command executed ok");
`mysql -h 127.0.0.1 -u root -e "grant all privileges on seccubus.* to seccubus\@localhost;"`;
is($?,0,"Command executed ok");
`mysql -h 127.0.0.1 -u root -e "flush privileges;"`;
is($?,0,"Command executed ok");
`mysql -h 127.0.0.1 -u root seccubus < db/structure_v$db_version.mysql`;
is($?,0,"Command executed ok");
`mysql -h 127.0.0.1 -u root seccubus < db/data_v$db_version.mysql`;
is($?,0,"Command executed ok");

my $t = Test::Mojo->new('Seccubus');

# Log in
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin', "content-type" => "application/json" })
    ->status_is(200,"Login ok")
;


my $config = get_config();

# Get the scanners
$t->get_ok('/api/scanners')
	;

# Compare with what is in the directories
my $i = 0;
my @scanners = sort glob $config->{paths}->{scanners} . "/*";

foreach my $scanner ( @scanners ) {
	my $help = `cat $scanner/help.html`;
	my $description = `cat $scanner/description.txt`;
	my $defaults = `cat $scanner/defaults.txt`;
	$scanner =~ /([^\/]*$)/;
	my $scannername = $1;
	$t->json_has("/$i")
	->json_is("/$i/help", $help)
	->json_is("/$i/description", $description)
	->json_is("/$i/params", $defaults)
	->json_is("/$i/name", $scannername)
	;
	$i++;
}
# That should be all folks
$t->json_hasnt("/$i");

done_testing();
