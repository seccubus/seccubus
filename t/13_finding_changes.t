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

my $tests;

sub decodeit(@);
sub webcall(@);


if (`hostname` =~ /^sbpd/) {
	$tests = 1;
	ok("Skipping these tests on the final build system");
} else {
	$tests = 0;
	my $db_version = 0;
	foreach my $data_file (<db/data_v*.mysql>) {
		$data_file =~ /^db\/data_v(\d+)\.mysql$/;
		$db_version = $1 if $1 > $db_version;
	}
	
	ok($db_version > 0, "DB version = $db_version");
	$tests++;
	`mysql -uroot -e "drop database seccubus"`;
	`mysql -uroot -e "create database seccubus"`;
	`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
	`mysql -uroot -e "flush privileges;"`;
	`mysql -uroot seccubus < db/structure_v$db_version.mysql`;
	`mysql -uroot seccubus < db/data_v$db_version.mysql`;

	my $json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/ConfigTest.pl`);
	foreach my $t ( @$json ) {
		if ( $t->{name} ne "Configuration file" ) { # Skip in container
			ok($t->{result} eq "OK", "$t->{name} ($t->{result}) eq OK?");
			$tests++;			
		}
	}
	
	# Loading AAAAAAA
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
	$json = webcall("getFindings.pl","workspaceId=100","scanIds[]=1");
	is(0+@$json,7,"7 findings returned"); $tests++;
	foreach my $id ( (1..7) ) {
		$json = webcall("getFindingHistory.pl", "workspaceId=100", "findingId=$id");
		is(0+@$json,1,"Should have 1 change record"); $tests++;
		is($$json[0]->{user},"importer","Change 1 is made by importer"); $tests++;
	}

	# Loading AAAAAAA-changes
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA-changes.ivil.xml`;
	$json = webcall("getFindings.pl","workspaceId=100","scanIds[]=1");
	is(0+@$json,7,"7 findings returned"); $tests++;
	foreach my $id ( (1..3) ) {
		$json = webcall("getFindingHistory.pl", "workspaceId=100", "findingId=$id");
		is(0+@$json,2,"Should have 2 change records"); $tests++;
		is($$json[0]->{user},"importer","Change 1 is made by importer"); $tests++;
		is($$json[1]->{user},"importer","Change 2 is made by importer"); $tests++;
		if ( $id == 1 ) {
			is($$json[0]->{severity},3,"Severity was changed"); $tests++;
			is($$json[1]->{severity},2,"Severity was preserved"); $tests++;
			is($$json[0]->{finding},"A","Finding wasn't changed in record 1"); $tests++;
			is($$json[1]->{finding},"A","Finding wasn't changed in record 2"); $tests++;
		} elsif ( $id == 2 ) {
			is($$json[0]->{finding},"B","Finding was changed"); $tests++;
			is($$json[1]->{finding},"A","Finding was preserved"); $tests++;
			is($$json[0]->{severity},2,"Severity wasn't changed in record 1"); $tests++;
			is($$json[1]->{severity},2,"Severity wasn't changed in record 2"); $tests++;
		} elsif ( $id == 3 ) {
			is($$json[0]->{severity},3,"Severity was changed"); $tests++;
			is($$json[1]->{severity},2,"Severity was preserved"); $tests++;
			is($$json[0]->{finding},"B","Finding was changed"); $tests++;
			is($$json[1]->{finding},"A","Finding was preserved"); $tests++;
		}
	}
	foreach my $id ( 4..7 ) {
		$json = webcall("getFindingHistory.pl", "workspaceId=100", "findingId=$id");
		is(0+@$json,2,"Finding $id should have 2 change records"); $tests++;
		is($$json[0]->{user},"importer","Change 1 is made by importer"); $tests++;
		is($$json[1]->{user},"importer","Change 2 is made by importer"); $tests++;
		is($$json[0]->{finding},"A","Finding wasn't changed in record 1"); $tests++;
		is($$json[1]->{finding},"A","Finding wasn't changed in record 2"); $tests++;
		is($$json[0]->{severity},2,"Severity wasn't changed in record 1"); $tests++;
		is($$json[1]->{severity},2,"Severity wasn't changed in record 2"); $tests++;
	}

	$json = webcall("updateFinding.pl", "workspaceId=100", "id=4", "status=1");
	$json = webcall("updateFinding.pl", "workspaceId=100", "id=5", "status=2");
	$json = webcall("updateFinding.pl", "workspaceId=100", "id=6", "status=1", "remark=test");
	$json = webcall("updateFinding.pl", "workspaceId=100", "id=7", "status=2", "remark=test");

	$json = webcall("getFindings.pl","workspaceId=100","scanIds[]=1");
	is(7,@$json,"7 findings returned"); $tests++;
	foreach my $id ( 1..4 ) {
		$json = webcall("getFindingHistory.pl", "workspaceId=100", "findingId=$id");
		is(0+@$json,2,"Finding $id should have 2 change records"); $tests++;
	}
	foreach my $id ( (5..7) ) {
		$json = webcall("getFindingHistory.pl", "workspaceId=100", "findingId=$id");
		is(0+@$json,3,"Should have 3 change records"); $tests++;
		is($$json[0]->{user},"admin","Change 1 is made by admin"); $tests++;
		is($$json[1]->{user},"importer","Change 2 is made by importer"); $tests++;
		is($$json[2]->{user},"importer","Change 3 is made by importer"); $tests++;
		is($$json[0]->{finding},"A","Finding wasn't changed in record 1"); $tests++;
		is($$json[1]->{finding},"A","Finding wasn't changed in record 2"); $tests++;
		is($$json[2]->{finding},"A","Finding wasn't changed in record 3"); $tests++;
		is($$json[0]->{severity},2,"Severity wasn't changed in record 1"); $tests++;
		is($$json[1]->{severity},2,"Severity wasn't changed in record 2"); $tests++;
		is($$json[2]->{severity},2,"Severity wasn't changed in record 4"); $tests++;
		if ( $id == 5 ) {
			is($$json[0]->{status},2,"Status was changed in record 1"); $tests++;
			is($$json[1]->{status},1,"Status was preserved in record 2"); $tests++;
			is($$json[2]->{status},1,"Status was preserved in record 3"); $tests++;
			is($$json[0]->{remark},undef,"Remark was preserved in record 1"); $tests++;
			is($$json[1]->{remark},undef,"Remark was preserved in record 2"); $tests++;
			is($$json[2]->{remark},undef,"Remark was preserved in record 3"); $tests++;
		} elsif ( $id == 6 ) {
			is($$json[0]->{status},1,"Status was preserved in record 1"); $tests++;
			is($$json[1]->{status},1,"Status was preserved in record 2"); $tests++;
			is($$json[2]->{status},1,"Status was preserved in record 3"); $tests++;
			is($$json[0]->{remark},"test","Remark was changed in record 1"); $tests++;
			is($$json[1]->{remark},undef,"Remark was preserved in record 2"); $tests++;
			is($$json[2]->{remark},undef,"Remark was preserved in record 3"); $tests++;
		} elsif ( $id == 7 ) {
			is($$json[0]->{status},2,"Status was changed in record 1"); $tests++;
			is($$json[1]->{status},1,"Status was preserved in record 2"); $tests++;
			is($$json[2]->{status},1,"Status was preserved in record 3"); $tests++;
			is($$json[0]->{remark},"test","Remark was changed in record 1"); $tests++;
			is($$json[1]->{remark},undef,"Remark was preserved in record 2"); $tests++;
			is($$json[2]->{remark},undef,"Remark was preserved in record 3"); $tests++;
		}
	}
	$json = webcall("getFindings.pl","workspaceId=100","scanIds[]=1");
	foreach my $id ( 1..7 ) { 
		my $hjson = webcall("getFindingHistory.pl", "workspaceId=100", "findingId=$id");
		foreach my $key ( qw(finding severity status remark run) ) {
			my $hkey = $key;
			$hkey = "find" if $key eq "finding";
			is($$hjson[0]->{$key},$$json[$id-1]->{$hkey},"Field $key of finding $id equals the same field in history record 1"); $tests++;
			#die Dumper($json);
		}
	}
}
done_testing($tests);

sub webcall(@) {
	my $call = shift;

	my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/$call ";
	$cmd .= join " ", @_;
	my @result = split /\r?\n/, `$cmd`;
	ok($cmd, "Ran: $cmd"); $tests++;
	while ( shift @result ) {};
	return decode_json(join "\n", @result);
}

sub decodeit(@) {
	my $line = 1;
	while( $line ) {
		$line = shift;
		$line =~ s/\r?\n//;
	}
	return decode_json(join "\n", @_);
}