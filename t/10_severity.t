#!/usr/bin/env perl
# Copyright 2016 Frank Breedijk
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
use Algorithm::Diff qw( diff );
use JSON;
use Data::Dumper;
use Test::More;

sub webcall(@);

my $tests = 0;

if (`hostname` =~ /^sbpd/) {
	$tests = 1;
	ok("Skipping these tests on the final build system");
} else {
	my $db_version = 0;
	foreach my $data_file (<db/data_v*.mysql>) {
		$data_file =~ /^db\/data_v(\d+)\.mysql$/;
		$db_version = $1 if $1 > $db_version;
	}
	
	ok($db_version > 0, "DB version = $db_version"); $tests++;
	`mysql -uroot -e "drop database seccubus"`;
	`mysql -uroot -e "create database seccubus"`;
	`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
	`mysql -uroot -e "flush privileges;"`;
	`mysql -uroot seccubus < db/structure_v$db_version.mysql`;
	`mysql -uroot seccubus < db/data_v$db_version.mysql`;

	my $json = webcall("ConfigTest.pl");
	foreach my $t ( @$json ) {
		if ( $t->{name} ne "Configuration file" ) { # Skip in container
			is($t->{result}, "OK", "$t->{name} ($t->{result}) eq OK?");
			$tests++;
		}
	}
	
	# Lets get those severities
	$json = webcall("getSeverity.pl");
	is(@$json, 5, "Correct number of records"); $tests++;
	is($$json[0]->{id}, 0, 'id correct'); $tests++;
	is($$json[0]->{name}, 'Not set', 'name correct'); $tests++;
	like($$json[0]->{description}, qr/^No severity/, 'description correct'); $tests++;
	is($$json[1]->{id}, 1, 'id correct'); $tests++;
	is($$json[1]->{name}, 'High', 'name correct'); $tests++;
	like($$json[1]->{description}, qr/^Direct compromise/, 'description correct'); $tests++;
	is($$json[2]->{id}, 2, 'id correct'); $tests++;
	is($$json[2]->{name}, 'Medium', 'name correct'); $tests++;
	like($$json[2]->{description}, qr/^Could compromise/, 'description correct'); $tests++;
	is($$json[3]->{id}, 3, 'id correct'); $tests++;
	is($$json[3]->{name}, 'Low', 'name correct'); $tests++;
	like($$json[3]->{description}, qr/^Weakens security/, 'description correct'); $tests++;
	is($$json[4]->{id}, 4, 'id correct'); $tests++;
	is($$json[4]->{name}, 'Note', 'name correct'); $tests++;
	like($$json[4]->{description}, qr/^Not a security issue/, 'description correct'); $tests++;

}

done_testing($tests);

sub webcall(@) {
	my $call = shift;

	my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/$call ";
	$cmd .= join " ", @_;
	my @result = split /\r?\n/, `$cmd`;
	while ( shift @result ) {};
	return decode_json(join "\n", @result);
}
