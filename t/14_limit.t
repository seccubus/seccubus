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
	
	# Loading AAAAAAA - 12-18
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/big.ivil.xml`;
	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1");
	is(@$json, 200, "200 findings returned by default?"); $tests++;

	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1", "Limit=0");
	is(@$json, 1001, "1001 findings returned without limit?"); $tests++;

	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1", "Limit=50");
	is(@$json, 50, "50 findings returned?"); $tests++;

	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1", "Limit=100");
	is(@$json, 100, "100 findings returned?"); $tests++;

	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1", "Limit=200");
	is(@$json, 200, "200 findings returned?"); $tests++;

	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1", "Limit=500");
	is(@$json, 500, "500 findings returned?"); $tests++;

	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1", "Limit=1000");
	is(@$json, 1000, "1000 findings returned?"); $tests++;



	#die Dumper $json;
}

done_testing($tests);

sub webcall(@) {
	my $call = shift;

	my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/$call ";
	$cmd .= join " ", @_;
	ok($cmd, "Running command $cmd"); $tests++;
	my @result = split /\r?\n/, `$cmd`;
	while ( shift @result ) {};
	return decode_json(join "\n", @result);
}
