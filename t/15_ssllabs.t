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

	# Create a workspace
	$json = webcall("createWorkspace.pl", "name=test1");
	is($$json[0]->{id},100,"Workspace created"); $tests++;
	# Create a scan
	$json = webcall("createScan.pl", "workspaceId=100", "name=ssl", "scanner=SSLlabs", "parameters=--hosts+\@HOSTS+--from-cache", "targets=www.seccubus.com\%0Awww.schubergphilis.com\%0Abadssl.com\%0Aexpired.badssl.com\%0Amozilla-old.badssl.com\%0Assl.sectionzero.org");
	is(@$json, 1, "Correct number of records returned"); $tests++;
	is($$json[0]->{id}, 1, "Correct ID returned"); $tests++;
	is($$json[0]->{name}, "ssl", "Correct name returned"); $tests++;
	is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned"); $tests++;
	is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache', "Correct parameters returned"); $tests++;
	is($$json[0]->{targets}, "www.seccubus.com\nwww.schubergphilis.com\nbadssl.com\nexpired.badssl.com\nmozilla-old.badssl.com\nssl.sectionzero.org", "Correct targets returned"); $tests++;
	is($$json[0]->{workspace}, 100, "Correct workspace returned"); $tests++;
	is($$json[0]->{password}, undef, "Correct password returned"); $tests++;
	
	# Create gradeonly scan
	$json = webcall("createScan.pl", "workspaceId=100", "name=gradeonly", "scanner=SSLlabs", "parameters=--hosts+\@HOSTS+--from-cache+--publish+--gradeonly", "targets=www.seccubus.com\%0Awww.schubergphilis.com");
	is(@$json, 1, "Correct number of records returned"); $tests++;
	is($$json[0]->{id}, 2, "Correct ID returned"); $tests++;
	is($$json[0]->{name}, "gradeonly", "Correct name returned"); $tests++;
	is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned"); $tests++;
	is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache --publish --gradeonly', "Correct parameters returned"); $tests++;
	is($$json[0]->{targets}, "www.seccubus.com\nwww.schubergphilis.com", "Correct targets returned"); $tests++;
	is($$json[0]->{workspace}, 100, "Correct workspace returned"); $tests++;
	is($$json[0]->{password}, undef, "Correct password returned"); $tests++;
	
	# Read scans back
	$json = webcall("getScans.pl", "workspaceId=100");
	is(@$json, 2, "Correct number of records returned"); $tests++;
	is($$json[1]->{id}, 1, "Correct ID returned"); $tests++;
	is($$json[1]->{name}, "ssl", "Correct name returned"); $tests++;
	is($$json[1]->{scanner}, "SSLlabs", "Correct scanner returned"); $tests++;
	is($$json[1]->{parameters}, '--hosts @HOSTS --from-cache', "Correct parameters returned"); $tests++;
	is($$json[1]->{targets}, "www.seccubus.com\nwww.schubergphilis.com\nbadssl.com\nexpired.badssl.com\nmozilla-old.badssl.com\nssl.sectionzero.org", "Correct targets returned"); $tests++;
	is($$json[1]->{workspace}, 100, "Correct workspace returned"); $tests++;
	is($$json[1]->{password}, undef, "Correct password returned"); $tests++;
	is($$json[0]->{id}, 2, "Correct ID returned"); $tests++;
	is($$json[0]->{name}, "gradeonly", "Correct name returned"); $tests++;
	is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned"); $tests++;
	is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache --publish --gradeonly', "Correct parameters returned"); $tests++;
	is($$json[0]->{targets}, "www.seccubus.com\nwww.schubergphilis.com", "Correct targets returned"); $tests++;
	is($$json[0]->{workspace}, 100, "Correct workspace returned"); $tests++;
	is($$json[0]->{password}, undef, "Correct password returned"); $tests++;
	
	# Lets run a scan
	pass("Running ssllabs scan"); $tests++;
	`perl -MSeccubusV2 -I SeccubusV2 bin/do-scan -w test1 -s ssl`;

	# Lets run a scan
	pass("Running gradeonly scan"); $tests++;
	`perl -MSeccubusV2 -I SeccubusV2 bin/do-scan -w test1 -s gradeonly`;

	# We should have a lot of findings in scan 1
	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1");
	my $count = @$json;
	cmp_ok(@$json, ">", 50, "Should have at least 50 findings in normal scan ($count)"); $tests++;
	foreach my $f ( @$json ) {
		unlike($f->{find}, qr/^Unknown finding/i, "Finding $f->{id} is not an unknown finding"); $tests++;
	}

	# We should only have grade or gradeTrustIgnored plugins
	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=2");
	foreach my $f ( @$json ) {
		like($f->{plugin}, qr/^grade(TrustIgnored)?$/i, "Finding $f->{id} is plugin type grade or gradeTrustIgnored"); $tests++;
	}

	#die Dumper $json;
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
