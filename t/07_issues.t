#!/usr/bin/env perl
# Copyright 2015 Frank Breedijk
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
my $tests = 0;

if (`hostname` =~ /^sbpd/) {
	$tests = 1;
	ok("Skipping these tests on the final build system");
} else {
	$tests = 999;
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

	#`cp etc/config.xml.mysql.example etc/config.xml`;
	if ( ! -e "/opt/seccubus" ) {
		`sudo ln -s \`pwd\` /opt/seccubus`;
	}
	if ( ! -e "/opt/seccubus/etc/config.xml" ) {
		`cp etc/config.xml.mysql.example etc/config.xml`;
	}

	my $json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/ConfigTest.pl`);
	foreach my $t ( @$json ) {
		ok($t->{result} eq "OK", "$t->{name} ($t->{result}) eq OK?");
		$tests++;
	}
	
	# Loading AAAAAAA - 12-18
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
	ok(7 == @$json, "Seven findings loaded?");

	# Need to provide a workspaceId
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/createIssue.pl`);
	ok($$json[0]->{error}, "Should error when workspaceId is missing");

	# Need to provide a numeric workspaceId
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/createIssue.pl`);
	ok($$json[0]->{error}, "Should error when workspaceId is not numeric");

	# Need a name
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/createIssue.pl workspaceId=100 severity=1 status=1`);
	ok($$json[0]->{error}, "Should error when name is missing");

	# Can we create an issue that is not linked to any findings?
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/createIssue.pl workspaceId=100 name=test1 severity=1 status=1`);
	ok($$json[0] == 1, "ID:1 returned");
	#die Dumper $json;

}

done_testing();

sub decodeit(@) {
	my $line = 1;
	while( $line ) {
		$line = shift;
		$line =~ s/\r?\n//;
	}
	return decode_json(join "\n", @_);
}