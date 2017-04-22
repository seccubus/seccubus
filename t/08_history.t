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
use Algorithm::Diff qw( diff );
use JSON;
use Data::Dumper;
use Test::More;

sub webcall(@);

if (`hostname` =~ /^sbpd/) {
	ok("Skipping these tests on the final build system");
} else {
	my $db_version = 0;
	foreach my $data_file (<db/data_v*.mysql>) {
		$data_file =~ /^db\/data_v(\d+)\.mysql$/;
		$db_version = $1 if $1 > $db_version;
	}
	
	ok($db_version > 0, "DB version = $db_version");
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
		}
	}

	# Create a workspace
	$json = webcall("createWorkspace.pl", "name=test1");
	is($$json[0]->{id},100,"Workspace created");
	# Create a scan
	$json = webcall("createScan.pl", "workspaceId=100", "name=ssl", "scanner=SSLlabs", "parameters=--hosts+\@HOSTS+--from-cache+--publish", "targets=www.seccubus.com\%0Awww.schubergphilis.com");
	is(@$json, 1, "Correct number of records returned");
	is($$json[0]->{id}, 1, "Correct ID returned");
	is($$json[0]->{name}, "ssl", "Correct name returned");
	is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned");
	is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache --publish', "Correct parameters returned");
	is($$json[0]->{targets}, "www.seccubus.com\nwww.schubergphilis.com", "Correct targets returned");
	is($$json[0]->{workspace}, 100, "Correct workspace returned");
	is($$json[0]->{password}, undef, "Correct password returned");
	
	# Read scans back
	$json = webcall("getScans.pl", "workspaceId=100");
	is(@$json, 1, "Correct number of records returned");
	is($$json[0]->{id}, 1, "Correct ID returned");
	is($$json[0]->{name}, "ssl", "Correct name returned");
	is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned");
	is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache --publish', "Correct parameters returned");
	is($$json[0]->{targets}, "www.seccubus.com\nwww.schubergphilis.com", "Correct targets returned");
	is($$json[0]->{workspace}, 100, "Correct workspace returned");
	is($$json[0]->{password}, undef, "Correct password returned");

	# Lets run a scan
	pass("Running scan test1");
	`bin/do-scan -w test1 -s ssl`;
	is($?,0,"Scan ran ok");

	# We should have a lot of findings
	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1");
	my $count = @$json;
	cmp_ok(@$json, ">", 50, "Should have at least 50 findings ($count)");

	# Check required params
	$json = webcall("getRuns.pl", "scanId=1");
	isnt($$json[0]->{error}, undef, "Got error");
	$json = webcall("getRuns.pl", "workspaceId=1");
	isnt($$json[0]->{error}, undef, "Got error");

	# We should have a run
	$json = webcall("getRuns.pl", "workspaceId=100", "scanId=1");
	is(@$json, 1, "Should have one run");
	is($$json[0]->{id}, 1, "Correct ID");
	isnt($$json[0]->{time}, undef, "Has a timestamp");
	is(@{$$json[0]->{attachments}}, 2, "Correct number of attachments");
	is($$json[0]->{attachments}[0]->{id}, 1, "Correct ID");
	like($$json[0]->{attachments}[0]->{name}, qr/^seccubus\.ssl\.\d+\.json$/, "Correct name");
	is($$json[0]->{attachments}[0]->{description}, "Raw JSON results", "Correct description");
	is($$json[0]->{attachments}[1]->{id}, 2, "Correct ID");
	like($$json[0]->{attachments}[1]->{name}, qr/^seccubus\.ssl\.\d+\.ivil\.xml$/, "Correct name");
	is($$json[0]->{attachments}[1]->{description}, "IVIL file", "Correct description");
	
	# Update all findings
	my @ids;
	for my $x ( 1..25 ) {
		push(@ids, "ids[]=$x");
	}
	$json = webcall("updateFindings.pl", "attrs[workspaceId]=100", "attrs[status]=2", @ids);
	is(@$json, 25, "Correct number of findings updated");

	# Check required params
	$json = webcall("getFindingHistory.pl", "findingId=1");
	ok($$json[0]->{error}, "Should error");
	$json = webcall("getFindingHistory.pl", "workspaceId=100");
	ok($$json[0]->{error}, "Should error");


	# First 25 findings should have 2 history records
	for my $x (1..25 ) {
		$json = webcall("getFindingHistory.pl", "workspaceId=100", "findingId=$x");
		is(@$json, 2, "Correct number of history records returned");
		is($$json[0]->{status}, 2, "Correct status record 1");
		is($$json[1]->{status}, 1, "Correct status record 2");
	}
	# Other findings should have 1 history records
	for my $x (26..$count ) {
		$json = webcall("getFindingHistory.pl", "workspaceId=100", "findingId=$x");
		is(@$json, 1, "Correct number of history records returned");
		is($$json[0]->{status}, 1, "Correct status record 1");
	}


	# Need to test this with assets too

	# Let's try to create an asset

	# Should not work without workspaceID
	$json = webcall("createAsset.pl");
	isnt($$json[0]->{error}, undef, "Got error");
	like($$json[0]->{error}, qr/workspace is missing/i, "Should complain about workspace");

	# Should not work without name
	$json = webcall("createAsset.pl", "workspace=100");
	isnt($$json[0]->{error}, undef, "Got error");
	like($$json[0]->{error}, qr/name is missing/i, "Should complain about name");

	# Should be ok
	$json = webcall("createAsset.pl", "workspace=100", "name=seccubus", "hosts=www.seccubus.com");
	is($$json[0]->{workspace},100,"Correct workspace");
	is($$json[0]->{id},1,"Correct ID");
	is($$json[0]->{hosts},"www.seccubus.com","Correct hosts");
	is($$json[0]->{recipient},undef,"Correct recipient");
	is($$json[0]->{name},"seccubus","Correct name");

	# We should have a lot of findings
	$json = webcall("getFindings.pl", "workspaceId=100", "assetIds[]=1");
	is($$json[0]->{error},undef,"Should not error");
	my $count = @$json;
	cmp_ok(@$json, ">", 25, "Should have at least 25 findings ($count)");

	foreach my $find ( @$json ) {
		like($find->{host}, qr/www\.seccubus\.com/,"Finding $find->{id} is about www.seccubus.com");
	}

	#die Dumper $json;
}

done_testing();

sub webcall(@) {
	my $call = shift;

	my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/$call ";
	$cmd .= join " ", @_;
	my @result = split /\r?\n/, `$cmd`;
	while ( shift @result ) {};
	return decode_json(join "\n", @result);
}
