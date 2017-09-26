#!/usr/bin/env perl
# Copyright 2016-2017 Frank Breedijk
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

my $db_version = shift;

unless ( $db_version ) {
	foreach my $data_file (glob "db/data_v*.mysql") {
		$data_file =~ /^db\/data_v(\d+)\.mysql$/;
		$db_version = $1 if $1 > $db_version;
	}
}

print "DB version = $db_version\n";
`mysql -h 127.0.0.1 -u root -e "drop database seccubus"`;
`mysql -h 127.0.0.1 -u root -e "create database seccubus"`;
`mysql -h 127.0.0.1 -u root -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
`mysql -h 127.0.0.1 -u root -e "flush privileges;"`;
`mysql -h 127.0.0.1 -u root seccubus < db/structure_v$db_version.mysql`;
`mysql -h 127.0.0.1 -u root seccubus < db/data_v$db_version.mysql`;
