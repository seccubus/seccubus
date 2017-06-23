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
# ------------------------------------------------------------------------------
# This little script checks all files te see if they are perl files and if so
# ------------------------------------------------------------------------------

use strict;
use Test::More;
use Algorithm::Diff qw( diff );
use Data::Dumper;

my $max_version = 0;
foreach my $data_file (glob "db/data_v*.mysql") {
	$data_file =~ /^db\/data_v(\d+)\.mysql$/;
	$max_version = $1 if $1 > $max_version;
}

cmp_ok($max_version, ">", 0, "Highest DB version = $max_version");

my $version = 2;
while ( $version <= $max_version) {
    $version = sprintf("%02d",$version);
	my $p_version = sprintf('%02d',$version -1);
	my $u_version = sprintf("v%02d_v%02d",$p_version,$version);

	`mysql -uroot -e "drop database seccubus_create"`;
    is($?,0,"Create DB dropped ok");
	`mysql -uroot -e "drop database seccubus_upgrade"`;
    is($?,0,"Upgrade DB dropped ok");
	`mysql -uroot -e "create database seccubus_create"`;
    is($?,0,"Create DB created ok");
	`mysql -uroot -e "create database seccubus_upgrade"`;
    is($?,0,"Upgrade DB created ok");
	`mysql -uroot seccubus_create < db/structure_v$version.mysql`;
    is($?,0,"db/structure_v$version.mysql loaded in craete DB");
	`mysql -uroot seccubus_create < db/data_v$version.mysql`;
    is($?,0,"db/data_v$version.mysql loaded in craete DB");
	`mysql -uroot seccubus_upgrade < db/structure_v$p_version.mysql`;
    is($?,0,"db/structure_v$p_version.mysql loaded in update DB");
	`mysql -uroot seccubus_upgrade < db/data_v$p_version.mysql`;
    is($?,0,"db/data_v$p_version.mysql loaded in update DB");
	`mysql -uroot seccubus_upgrade < db/upgrade_$u_version.mysql`;
	is($?,0,"$u_version upgrade procedure done");
	my $create = `mysqldump -uroot seccubus_create`;
	my $upgrade = `mysqldump -uroot seccubus_upgrade`;

	$create =~ s/\-\- Host.*?\n//;
	$upgrade =~ s/\-\- Host.*?\n//;
	$create =~ s/\-\- Dump completed on .*?\n//;
	$upgrade =~ s/\-\- Dump completed on .*?\n//;


	open(my $C, ">", "/tmp/seccubus_create") or die;
	print $C $create;
	close $C;
	open(my $U, ">", "/tmp/seccubus_upgrade") or die;
	print $U $upgrade;
	close $U;
	my $diff = `diff -u /tmp/seccubus_create /tmp/seccubus_upgrade`;
	cmp_ok($diff, "eq", "", "v$version equal to $u_version upgrade?");
	$version++;
}

done_testing();
