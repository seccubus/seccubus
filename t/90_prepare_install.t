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
# This little script checks all files te see if they are perl files and if so 
# ------------------------------------------------------------------------------

use strict;
use Test::More;

my $tests = 0;

`rm -f errors.txt`;

my $ZEPATH=`pwd`;
chomp($ZEPATH);

if ( ! -e "$ZEPATH/tmp" ) {
	`mkdir $ZEPATH/tmp`;
}

if ( ! -e "$ZEPATH/tmp/install" ) {
	`mkdir $ZEPATH/tmp/install`;
} else {
	`rm -rf $ZEPATH/tmp/install/*`;
}
`mkdir $ZEPATH/tmp/install/seccubus`;

ok("Install directory prepared");
$tests++;

my $count = chomp(`ls Seccubus-*.tar.gz|wc -l`);
if ( $count ) {
	`rm Seccubus-*.tar.gz`;
	ok("Old tarball removed");
	$tests++;
}

`make clean`;
ok("Clean build created");
$tests++;

`perl Makefile.PL`;
ok("New makefile created");
$tests++;

`make manifest`;
ok("Manifest created");
$tests++;

`make`;
ok("Build created");
$tests++;

`make dist`;
ok("New tarball created");
$tests++;

`cd $ZEPATH/tmp/install;tar -xvzf ../../Seccubus*.tar.gz`;
ok("Untarred");
$tests++;

`cd $ZEPATH/tmp/install/Seccubus-*;./install.pl --basedir $ZEPATH/tmp/install/seccubus --createdirs -v -v -v`;
ok("Installed");
$tests++;

`cp $ZEPATH/tmp/install/seccubus/etc/config.xml.mysql.example $ZEPATH/tmp/install/seccubus/etc/config.xml`;
ok("Configured");
$tests++;

done_testing($tests);
