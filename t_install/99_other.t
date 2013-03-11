#!/usr/bin/env perl
# Copyright 2013 Frank Breedijk
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

use strict;
use Test::More tests => 10;

my $basedir = "tmp/install/seccubus";

my $diff = `diff $basedir/SeccubusV2.pm $basedir/www/seccubus/SeccubusV2.pm 2>&1`;
cmp_ok($diff, "eq", "", "Symlink in $basedir/www/seccubus/SeccubusV2.pm");

foreach my $dir ( qw(
			www/
			www/seccubus
			www/steal
			www/seccubus
			www/seccubus/img
			www/seccubus/json
		  ) ) {
	if ( -d "$basedir/$dir" ) {
		pass("$basedir/$dir");
	} else {
		fail("$basedir/$dir");
	}
}

my $pwd = `pwd`;
chomp $pwd;
isnt(`grep $basedir/etc/config.xml  $basedir/SeccubusV2.pm`, "", "SeccubusV2.pm patched");
isnt(`grep $basedir/etc/config.xml  $basedir/www/seccubus/json/ConfigTest.pl`, "", "ConfigTest.pl patched");
is  (`grep $basedir  $basedir/etc/config.xml.mysql.example|wc -l`, "5\n", "config.xml.mysql.example patched");
