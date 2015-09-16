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

	#`cp etc/config.xml.mysql.example etc/config.xml`;
	if ( ! -e "/opt/seccubus" ) {
		`sudo ln -s \`pwd\` /opt/seccubus`;
	}
	if ( ! -e "/opt/seccubus/etc/config.xml" ) {
		`cp etc/config.xml.mysql.example etc/config.xml`;
	}

	my $json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/ConfigTest.pl`);
	foreach my $t ( @$json ) {
		if ( $t->{name} ne "Configuration file" ) { # Skip in container
			is($t->{result}, "OK", "$t->{name} ($t->{result}) eq OK?");
			$tests++;
		}
	}
	
	# Loading AAAAAAA - 12-18
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
	is(@$json, 7, "Seven findings loaded?"); $tests++;

	# Need to provide a workspaceId
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl`);
	ok($$json[0]->{error}, "Should error when workspaceId is missing"); $tests++;

	# Need to provide a numeric workspaceId
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl`);
	ok($$json[0]->{error}, "Should error when workspaceId is not numeric"); $tests++;

	# Need a name
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl workspaceId=100 severity=1 status=1`);
	ok($$json[0]->{error}, "Should error when name is missing"); $tests++;

	# Can we create an issue that is not linked to any findings?
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl workspaceId=100 name=test1 ext_ref=test1 description=test1 severity=0 status=1`);
	is($$json[0], 1, "First insert: ID:1 returned"); $tests++;

	# Are default values set when we omit them?
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl workspaceId=100 name=test1 ext_ref=test1 description=test1`);
	is($$json[0], 2, "Second insert: ID:2 returned ($$json[0])"); $tests++;

	# OK, time to read them back...
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssues.pl workspaceId=100`);
	is(@$json, 2, "Two rows returned"); $tests++;

	is($$json[0]->{id}, 1, "First record is record 1"); $tests++;
	is($$json[1]->{id}, 2, "Second record is record 2"); $tests++;
	
	# Reset IDs
	$$json[0]->{id} = 0;
	$$json[1]->{id} = 0;

	is_deeply($$json[0], $$json[1], "Both issues are otherwise equal"); $tests++;

	is($$json[0]->{name}, 'test1', "name = test1"); $tests++;
	is($$json[0]->{ext_ref}, 'test1', "ext_ref eq 'test1'"); $tests++;
	is($$json[0]->{description}, 'test1', "description eq 'test1'"); $tests++;
	is($$json[0]->{severity}, 0, "severity == 0"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName eq 'Not set'"); $tests++;
	is($$json[0]->{status}, 1, "status == 1"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName eq 'Open'"); $tests++;

	# Can we update the text fields?
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl issueId=1 workspaceId=100 name=test2 ext_ref=test2 description=test2`);
	is($$json[0]->{name}, 'test2', "name = test2"); $tests++;
	is($$json[0]->{ext_ref}, 'test2', "ext_ref eq 'test2'"); $tests++;
	is($$json[0]->{description}, 'test2', "description eq 'test2'"); $tests++;
	is($$json[0]->{severity}, 0, "severity == 0"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName eq 'Not set'"); $tests++;
	is($$json[0]->{status}, 1, "status == 1"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName eq 'Open'"); $tests++;

	# OK, time to read them back...
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssues.pl workspaceId=100`);
	is(@$json, 2, "Two, returned"); $tests++;
	is($$json[0]->{name}, 'test2', "name = test2"); $tests++;
	is($$json[0]->{ext_ref}, 'test2', "ext_ref eq 'test2'"); $tests++;
	is($$json[0]->{description}, 'test2', "description eq 'test2'"); $tests++;
	is($$json[0]->{severity}, 0, "severity == 0"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName eq 'Not set'"); $tests++;
	is($$json[0]->{status}, 1, "status == 1"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName eq 'Open'"); $tests++;

	# Can we update the numeric fields?
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl issueId=2 workspaceId=100 status=2 severity=1`);
	is($$json[0]->{name}, 'test1', "name = test1"); $tests++;
	is($$json[0]->{ext_ref}, 'test1', "ext_ref eq 'test1'"); $tests++;
	is($$json[0]->{description}, 'test1', "description eq 'test1'"); $tests++;
	is($$json[0]->{severity}, 1, "severity == 1"); $tests++;
	is($$json[0]->{severityName}, 'High', "severityName eq 'High'"); $tests++;
	is($$json[0]->{status}, 2, "status == 2"); $tests++;
	is($$json[0]->{statusName}, 'Closed', "statusName eq 'Closed'"); $tests++;

	# OK, time to read them back...
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssues.pl workspaceId=100`);
	is(@$json, 2, "Two, returned"); $tests++;
	is($$json[1]->{name}, 'test1', "name = test1"); $tests++;
	is($$json[1]->{ext_ref}, 'test1', "ext_ref eq 'test1'"); $tests++;
	is($$json[1]->{description}, 'test1', "description eq 'test1'"); $tests++;
	is($$json[1]->{severity}, 1, "severity == 1"); $tests++;
	is($$json[1]->{severityName}, 'High', "severityName eq 'High'"); $tests++;
	is($$json[1]->{status}, 2, "status == 2"); $tests++;
	is($$json[1]->{statusName}, 'Closed', "statusName eq 'Closed'"); $tests++;

	# Lets check update records. Create a new record
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl workspaceId=100 name=test3 ext_ref=test3 description=test3 severity=1 status=2`);
	is($$json[0], 3, "Inserted ID correct"); $tests++;

	# Let's do an update that isn't an update
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/updateIssue.pl issueId=3 workspaceId=100 name=test3 ext_ref=test3 description=test3 severity=1 status=2`);
	is($$json[0]->{name}, 'test3', "name ok"); $tests++;
	is($$json[0]->{ext_ref}, 'test3', "ext_ref ok"); $tests++;
	is($$json[0]->{description}, 'test3', "description ok"); $tests++;
	is($$json[0]->{severity}, 1, "severity ok"); $tests++;
	is($$json[0]->{severityName}, 'High', "severityName ok"); $tests++;
	is($$json[0]->{status}, 2, "status ok"); $tests++;
	is($$json[0]->{statusName}, 'Closed', "statusName ok"); $tests++;

	# OK, time to read them back...
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssues.pl workspaceId=100`);
	is(@$json, 3, "Correct number of records"); $tests++;
	is($$json[2]->{name}, 'test3', "name ok"); $tests++;
	is($$json[2]->{ext_ref}, 'test3', "ext_ref ok"); $tests++;
	is($$json[2]->{description}, 'test3', "description ok"); $tests++;
	is($$json[2]->{severity}, 1, "severity ok"); $tests++;
	is($$json[2]->{severityName}, 'High', "severityName ok"); $tests++;
	is($$json[2]->{status}, 2, "status ok"); $tests++;
	is($$json[2]->{statusName}, 'Closed', "statusName ok"); $tests++;

	# Error protection getIssueHistory
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssueHistory.pl issueId=1`);
	ok($$json[0]->{error}, "Should error when workspaceId is missing"); $tests++;
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssueHistory.pl issueId=1 workspaceId=a`);
	ok($$json[0]->{error}, "Should error when workspaceId is not numeric"); $tests++;
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssueHistory.pl workspaceId=100`);
	ok($$json[0]->{error}, "Should error when issueId is missing"); $tests++;
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssueHistory.pl issueId=a workspaceId=100`);
	ok($$json[0]->{error}, "Should error when issueId is not numeric"); $tests++;

	# Lets get the history of record 1
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getIssueHistory.pl issueId=1 workspaceId=100`);
	is(@$json, 2, "Correct number of records"); $tests++;
	# Current values
	is($$json[0]->{name}, 'test2', "name ok"); $tests++;
	is($$json[0]->{ext_ref}, 'test2', "ext_ref ok"); $tests++;
	is($$json[0]->{description}, 'test2', "description ok"); $tests++;
	is($$json[0]->{severity}, 0, "severity ok"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName ok"); $tests++;
	is($$json[0]->{status}, 1, "status ok"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName ok"); $tests++;
	# Original findings
	is($$json[0]->{name}, 'test2', "name ok"); $tests++;
	is($$json[0]->{ext_ref}, 'test2', "ext_ref ok"); $tests++;
	is($$json[0]->{description}, 'test2', "description ok"); $tests++;
	is($$json[0]->{severity}, 0, "severity ok"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName ok"); $tests++;
	is($$json[0]->{status}, 1, "status ok"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName ok"); $tests++;

	#die Dumper $json;
}

done_testing($tests);

sub decodeit(@) {
	my $line = 1;
	while( $line ) {
		$line = shift;
		$line =~ s/\r?\n//;
	}
	return decode_json(join "\n", @_);
}