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

	my $json = webcall("ConfigTest.pl");
	foreach my $t ( @$json ) {
		if ( $t->{name} ne "Configuration file" ) { # Skip in container
			is($t->{result}, "OK", "$t->{name} ($t->{result}) eq OK?");
			$tests++;
		}
	}
	
	# Loading AAAAAAA - 12-18
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
	$json = webcall("getFindings.pl", "workspaceId=100", "scanIds[]=1");
	is(@$json, 7, "Seven findings loaded?"); $tests++;

	$json = webcall("getFilters.pl");
	ok($$json[0]->{error}, "Should error when workspaceId is missing"); $tests++;

	$json = webcall("getFilters.pl", "workspaceId=100");
	ok($$json[0]->{error}, "Should error when scanIds[] is missing"); $tests++;

	# Test if the correct filter is returned
	$json = webcall("getFilters.pl", "workspaceId=100", "scanIds[]=1");
	ok($json->{issue}, "Should have an issue attribute in response"); $tests++;
	is(@{$json->{issue}}, 2, "Correct number of items"); $tests++;
	is($json->{issue}[0]->{name}, '*', "Correct issue name"); $tests++;
	is($json->{issue}[0]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[0]->{number}, 7, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[1]->{name}, '---', "Correct issue name"); $tests++;
	is($json->{issue}[1]->{selected}, undef,"Issue select value ok"); $tests++;
	is($json->{issue}[1]->{number}, -1, "Correct number of findings linked"); $tests++;	
	
	# Need to provide a workspaceId
	$json = webcall("updateIssue.pl");
	ok($$json[0]->{error}, "Should error when workspaceId is missing"); $tests++;

	# Need to provide a numeric workspaceId
	$json = webcall("updateIssue.pl", "workspaceId=a");
	ok($$json[0]->{error}, "Should error when workspaceId is not numeric"); $tests++;

	# Need a name
	$json = webcall("updateIssue.pl", "workspaceId=100", "severity=1", "status=1");
	ok($$json[0]->{error}, "Should error when name is missing"); $tests++;

	# Can we create an issue that is not linked to any findings?
	$json = webcall("updateIssue.pl", "workspaceId=100", "name=test1", "ext_ref=SEC-1", "description=description1", "severity=0", "status=1");
	is($$json[0], 1, "First insert: ID:1 returned"); $tests++;

	# Are default values set when we omit them?
	$json = webcall("updateIssue.pl", "workspaceId=100", "name=test1", "ext_ref=SEC-1", "description=description1");
	is($$json[0], 2, "Second insert: ID:2 returned ($$json[0])"); $tests++;

	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 2, "Two rows returned"); $tests++;

	is($$json[0]->{id}, 1, "First record is record 1"); $tests++;
	is($$json[1]->{id}, 2, "Second record is record 2"); $tests++;
	
	# Reset IDs
	$$json[0]->{id} = 0;
	$$json[1]->{id} = 0;

	is_deeply($$json[0], $$json[1], "Both issues are otherwise equal"); $tests++;

	is($$json[0]->{name}, 'test1', "name = test1"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-1', "ext_ref eq 'SEC-1'"); $tests++;
	is($$json[0]->{description}, 'description1', "description eq 'description1'"); $tests++;
	is($$json[0]->{severity}, 0, "severity == 0"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName eq 'Not set'"); $tests++;
	is($$json[0]->{status}, 1, "status == 1"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName eq 'Open'"); $tests++;

	# Test if the correct filter is returned
	$json = webcall("getFilters.pl", "workspaceId=100", "scanIds[]=1");
	ok($json->{issue}, "Should have an issue attribute in response"); $tests++;
	is(@{$json->{issue}}, 4, "Correct number of items"); $tests++;
	is($json->{issue}[0]->{name}, '*', "Correct issue name"); $tests++;
	is($json->{issue}[0]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[0]->{number}, 7, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[1]->{name}, '---', "Correct issue name"); $tests++;
	is($json->{issue}[1]->{selected}, undef,"Issue select value ok"); $tests++;
	is($json->{issue}[1]->{number}, -1, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[2]->{name}, 'test1 (SEC-1)', "Correct issue name"); $tests++;
	is($json->{issue}[2]->{value}, 1, "Correct issue id"); $tests++;
	is($json->{issue}[2]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[2]->{number}, 0, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[3]->{name}, 'test1 (SEC-1)', "Correct issue name"); $tests++;
	is($json->{issue}[3]->{value}, 2, "Correct issue id"); $tests++;
	is($json->{issue}[3]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[3]->{number}, 0, "Correct number of findings linked"); $tests++;	

	# Can we update the text fields?
	$json = webcall("updateIssue.pl", "issueId=1", "workspaceId=100", "name=test2", "ext_ref=SEC-2", "description=description2");
	is($$json[0]->{name}, 'test2', "name = test2"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-2', "ext_ref eq 'SEC-2'"); $tests++;
	is($$json[0]->{description}, 'description2', "description eq 'description2'"); $tests++;
	is($$json[0]->{severity}, 0, "severity == 0"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName eq 'Not set'"); $tests++;
	is($$json[0]->{status}, 1, "status == 1"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName eq 'Open'"); $tests++;

	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 2, "Two, returned"); $tests++;
	is($$json[0]->{name}, 'test2', "name = test2"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-2', "ext_ref eq 'SEC-2'"); $tests++;
	is($$json[0]->{description}, 'description2', "description eq 'description2'"); $tests++;
	is($$json[0]->{severity}, 0, "severity == 0"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName eq 'Not set'"); $tests++;
	is($$json[0]->{status}, 1, "status == 1"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName eq 'Open'"); $tests++;

	# Can we update the numeric fields?
	$ENV{REMOTE_USER} = 'importer';
	$json = webcall("updateIssue.pl", "issueId=2", "workspaceId=100", "status=2", "severity=1");
	$ENV{REMOTE_USER} = undef;
	is($$json[0]->{name}, 'test1', "name = test1"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-1', "ext_ref eq 'SEC-1'"); $tests++;
	is($$json[0]->{description}, 'description1', "description ok"); $tests++;
	is($$json[0]->{severity}, 1, "severity == 1"); $tests++;
	is($$json[0]->{severityName}, 'High', "severityName eq 'High'"); $tests++;
	is($$json[0]->{status}, 2, "status == 2"); $tests++;
	is($$json[0]->{statusName}, 'Closed', "statusName eq 'Closed'"); $tests++;

	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 2, "Two, returned"); $tests++;
	is($$json[1]->{name}, 'test1', "name = test1"); $tests++;
	is($$json[1]->{ext_ref}, 'SEC-1', "ext_ref eq 'SEC-1'"); $tests++;
	is($$json[1]->{description}, 'description1', "description eq 'description1'"); $tests++;
	is($$json[1]->{severity}, 1, "severity == 1"); $tests++;
	is($$json[1]->{severityName}, 'High', "severityName eq 'High'"); $tests++;
	is($$json[1]->{status}, 2, "status == 2"); $tests++;
	is($$json[1]->{statusName}, 'Closed', "statusName eq 'Closed'"); $tests++;

	# Lets check update records. Create a new record
	$json = webcall("updateIssue.pl", "workspaceId=100", "name=test3", "ext_ref=SEC-3", "description=description3",
		"severity=1", "status=2");
	is($$json[0], 3, "Inserted ID correct"); $tests++;

	# Let's do an update that isn't an update
	$json = webcall("updateIssue.pl", "issueId=3", "workspaceId=100", "name=test3", "ext_ref=SEC-3", 
		"description=description3", "severity=1", "status=2");
	is($$json[0]->{name}, 'test3', "name ok"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-3', "ext_ref ok"); $tests++;
	is($$json[0]->{description}, 'description3', "description ok"); $tests++;
	is($$json[0]->{severity}, 1, "severity ok"); $tests++;
	is($$json[0]->{severityName}, 'High', "severityName ok"); $tests++;
	is($$json[0]->{status}, 2, "status ok"); $tests++;
	is($$json[0]->{statusName}, 'Closed', "statusName ok"); $tests++;

	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 3, "Correct number of records"); $tests++;
	is($$json[2]->{name}, 'test3', "name ok"); $tests++;
	is($$json[2]->{ext_ref}, 'SEC-3', "ext_ref ok"); $tests++;
	is($$json[2]->{description}, 'description3', "description ok"); $tests++;
	is($$json[2]->{severity}, 1, "severity ok"); $tests++;
	is($$json[2]->{severityName}, 'High', "severityName ok"); $tests++;
	is($$json[2]->{status}, 2, "status ok"); $tests++;
	is($$json[2]->{statusName}, 'Closed', "statusName ok"); $tests++;

	# Error protection getIssueHistory
	$json = webcall("getIssueHistory.pl", "issueId=1");
	ok($$json[0]->{error}, "Should error when workspaceId is missing"); $tests++;
	$json = webcall("getIssueHistory.pl", "issueId=1", "workspaceId=a");
	ok($$json[0]->{error}, "Should error when workspaceId is not numeric"); $tests++;
	$json = webcall("getIssueHistory.pl", "workspaceId=100");
	ok($$json[0]->{error}, "Should error when issueId is missing"); $tests++;
	$json = webcall("getIssueHistory.pl", "issueId=a", "workspaceId=100");
	ok($$json[0]->{error}, "Should error when issueId is not numeric"); $tests++;

	# Lets get the history of record 1
	$json = webcall("getIssueHistory.pl", "issueId=1", "workspaceId=100");
	is(@$json, 2, "Correct number of records"); $tests++;
	# Current values
	is($$json[0]->{name}, 'test2', "name ok"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-2', "ext_ref ok"); $tests++;
	is($$json[0]->{description}, 'description2', "description ok"); $tests++;
	is($$json[0]->{severity}, 0, "severity ok"); $tests++;
	is($$json[0]->{severityName}, 'Not set', "severityName ok"); $tests++;
	is($$json[0]->{status}, 1, "status ok"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName ok"); $tests++;
	is($$json[0]->{userId}, 1, "userId ok"); $tests++;
	is($$json[0]->{userName}, 'admin', "userName ok"); $tests++;
	# Original findings
	is($$json[1]->{name}, 'test1', "name ok"); $tests++;
	is($$json[1]->{ext_ref}, 'SEC-1', "ext_ref ok"); $tests++;
	is($$json[1]->{description}, 'description1', "description ok"); $tests++;
	is($$json[1]->{severity}, 0, "severity ok"); $tests++;
	is($$json[1]->{severityName}, 'Not set', "severityName ok"); $tests++;
	is($$json[1]->{status}, 1, "status ok"); $tests++;
	is($$json[1]->{statusName}, 'Open', "statusName ok"); $tests++;
	is($$json[1]->{userId}, 1, "userId ok"); $tests++;
	is($$json[1]->{userName}, 'admin', "userName ok"); $tests++;

	# Lets get the history of record 2
	$json = webcall("getIssueHistory.pl", "issueId=2", "workspaceId=100");
	is(@$json, 2, "Correct number of records"); $tests++;
	# Current values
	is($$json[0]->{name}, 'test1', "name ok"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-1', "ext_ref ok"); $tests++;
	is($$json[0]->{description}, 'description1', "description ok"); $tests++;
	is($$json[0]->{severity}, 1, "severity ok"); $tests++;
	is($$json[0]->{severityName}, 'High', "severityName ok"); $tests++;
	is($$json[0]->{status}, 2, "status ok"); $tests++;
	is($$json[0]->{statusName}, 'Closed', "statusName ok"); $tests++;
	is($$json[0]->{userId}, 3, "userId ok"); $tests++;
	is($$json[0]->{userName}, 'importer', "userName ok"); $tests++;
	# Original values
	is($$json[1]->{name}, 'test1', "name ok"); $tests++;
	is($$json[1]->{ext_ref}, 'SEC-1', "ext_ref ok"); $tests++;
	is($$json[1]->{description}, 'description1', "description ok"); $tests++;
	is($$json[1]->{severity}, 0, "severity ok"); $tests++;
	is($$json[1]->{severityName}, 'Not set', "severityName ok"); $tests++;
	is($$json[1]->{status}, 1, "status ok"); $tests++;
	is($$json[1]->{statusName}, 'Open', "statusName ok"); $tests++;
	is($$json[1]->{userId}, 1, "userId ok"); $tests++;
	is($$json[1]->{userName}, 'admin', "userName ok"); $tests++;

	# Lets get the history of record 3
	$json = webcall("getIssueHistory.pl", "issueId=3", "workspaceId=100");
	is(@$json, 1, "Correct number of records"); $tests++;
	# Current values
	is($$json[0]->{name}, 'test3', "name ok"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-3', "ext_ref ok"); $tests++;
	is($$json[0]->{description}, 'description3', "description ok"); $tests++;
	is($$json[0]->{severity}, 1, "severity ok"); $tests++;
	is($$json[0]->{severityName}, 'High', "severityName ok"); $tests++;
	is($$json[0]->{status}, 2, "status ok"); $tests++;
	is($$json[0]->{statusName}, 'Closed', "statusName ok"); $tests++;
	is($$json[0]->{userId}, 1, "userId ok"); $tests++;
	is($$json[0]->{userName}, 'admin', "userName ok"); $tests++;

	# Lets create an issue with linked findings
	$json = webcall("updateIssue.pl", "workspaceId=100", "name=test4", "ext_ref=SEC-4", 
		"description=description4", "severity=1", "status=1", "findingIds[]=1", "findingIds[]=2", 
		"findingIds[]=3", "findingIds[]=3");
	is($$json[0], 4, "Inserted ID correct"); $tests++;
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 4, "Correct number of records"); $tests++;
	is($$json[3]->{name}, 'test4', "name ok"); $tests++;
	is($$json[3]->{ext_ref}, 'SEC-4', "ext_ref ok"); $tests++;
	is($$json[3]->{description}, 'description4', "description ok"); $tests++;
	is($$json[3]->{severity}, 1, "severity ok"); $tests++;
	is($$json[3]->{severityName}, 'High', "severityName ok"); $tests++;
	is($$json[3]->{status}, 1, "status ok"); $tests++;
	is($$json[3]->{statusName}, 'Open', "statusName ok"); $tests++;
	is(@{$$json[3]->{findings}}, 3, "number of linked findings ok"); $tests++;
	is($$json[3]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[1]->{id}, 2, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[2]->{id}, 3, "linked finding ok"); $tests++;

	# Test if the correct filter is returned
	$json = webcall("getFilters.pl", "workspaceId=100", "scanIds[]=1");
	ok($json->{issue}, "Should have an issue attribute in response"); $tests++;
	is(@{$json->{issue}}, 6, "Correct number of items"); $tests++;
	is($json->{issue}[0]->{name}, '*', "Correct issue name"); $tests++;
	is($json->{issue}[0]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[0]->{number}, 7, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[1]->{name}, 'test4 (SEC-4)', "Correct issue name"); $tests++;
	is($json->{issue}[1]->{value}, 4, "Correct issue id"); $tests++;
	is($json->{issue}[1]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[1]->{number}, 3, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[2]->{name}, '---', "Correct issue name"); $tests++;
	is($json->{issue}[2]->{selected}, undef,"Issue select value ok"); $tests++;
	is($json->{issue}[2]->{number}, -1, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[3]->{name}, 'test2 (SEC-2)', "Correct issue name"); $tests++;
	is($json->{issue}[3]->{value}, 1, "Correct issue id"); $tests++;
	is($json->{issue}[3]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[3]->{number}, 0, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[4]->{name}, 'test1 (SEC-1)', "Correct issue name"); $tests++;
	is($json->{issue}[4]->{value}, 2, "Correct issue id"); $tests++;
	is($json->{issue}[4]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[4]->{number}, 0, "Correct number of findings linked"); $tests++;	

	# Can we link across workspaces?
	$json = webcall("createWorkspace.pl", "name=test2");
	is($$json[0]->{id},101,"Workspace created"); $tests++;
	is($$json[0]->{name},"test2","Workspace created"); $tests++;
	$json = webcall("updateIssue.pl", "workspaceId=101", "name=test5", "ext_ref=SEC-5", 
		"description=description5", "severity=1", "status=1", "findingIds[]=1", "findingIds[]=2", 
		"findingIds[]=3", "findingIds[]=3");
	is($$json[0], 5, "Inserted ID correct"); $tests++;
	$json = webcall("getIssues.pl", "workspaceId=101");
	is(@$json, 1, "Correct number of records"); $tests++;
	is($$json[0]->{name}, 'test5', "name ok"); $tests++;
	is($$json[0]->{ext_ref}, 'SEC-5', "ext_ref ok"); $tests++;
	is($$json[0]->{description}, 'description5', "description ok"); $tests++;
	is($$json[0]->{severity}, 1, "severity ok"); $tests++;
	is($$json[0]->{severityName}, 'High', "severityName ok"); $tests++;
	is($$json[0]->{status}, 1, "status ok"); $tests++;
	is($$json[0]->{statusName}, 'Open', "statusName ok"); $tests++;
	is(@{$$json[0]->{findings}}, 0, "number of linked findings ok"); $tests++;

	# Can we link to existing issue?
	$json = webcall("updateIssue.pl", "issueId=4", "workspaceId=100", "findingIds[]=4");
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 4, "Correct number of records"); $tests++;
	is(@{$$json[3]->{findings}}, 4, "number of linked findings ok"); $tests++;
	is($$json[3]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[1]->{id}, 2, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[2]->{id}, 3, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[3]->{id}, 4, "linked finding ok"); $tests++;

	# Should be able to read them back via getFindings...
	$json = webcall("getFindings.pl", "workspaceId=100", "Issue=4"); $tests++;
	is(@$json, 4, "Correct number of records");
	is($$json[0]->{id}, 1, "linked finding ok"); $tests++;
	is($$json[1]->{id}, 2, "linked finding ok"); $tests++;
	is($$json[2]->{id}, 3, "linked finding ok"); $tests++;
	is($$json[3]->{id}, 4, "linked finding ok"); $tests++;
	

	# Shouldn't be able to crosslink in this way
	$json = webcall("updateIssue.pl", "issueId=5", "workspaceId=101", "findingIds[]=4");
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=101");
	is(@$json, 1, "Correct number of records"); $tests++;
	is(@{$$json[0]->{findings}}, 0, "number of linked findings ok"); $tests++;

	# Unlink error conditions
	$json = webcall("unlinkFindingIssue.pl");
	is(@$json, 1, "Correct number of records"); $tests++;
	like($$json[0]->{error}, qr/workspaceid/i, "Returns correct error"); $tests++;

	$json = webcall("unlinkFindingIssue.pl", "workspaceId=100");
	is(@$json, 1, "Correct number of records"); $tests++;
	like($$json[0]->{error}, qr/issueid/i, "Returns correct error"); $tests++;

	$json = webcall("unlinkFindingIssue.pl", "issueId=4", "workspaceId=100");
	is(@$json, 1, "Correct number of records"); $tests++;
	like($$json[0]->{error}, qr/findingId/i, "Returns correct error"); $tests++;

	# Can we unlink an issue
	$json = webcall("unlinkFindingIssue.pl", "issueId=4", "workspaceId=100", "findingIds[]=4");
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 4, "Correct number of records"); $tests++;
	is(@{$$json[3]->{findings}}, 3, "number of linked findings ok"); $tests++;
	is($$json[3]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[1]->{id}, 2, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[2]->{id}, 3, "linked finding ok"); $tests++;

	# Can we unlink multiple issues
	$json = webcall("unlinkFindingIssue.pl", "issueId=4", "workspaceId=100", "findingIds[]=2", "findingIds[]=3");
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 4, "Correct number of records"); $tests++;
	is(@{$$json[3]->{findings}}, 1, "number of linked findings ok"); $tests++;
	is($$json[3]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;

	# Shouldn't be able to unlink an issue that isn't linked
	$json = webcall("unlinkFindingIssue.pl", "issueId=4", "workspaceId=100", "findingIds[]=4");
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 4, "Correct number of records"); $tests++;
	is(@{$$json[3]->{findings}}, 1, "number of linked findings ok"); $tests++;
	is($$json[3]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;

	# Unlink via updateIssue
	# Relink first
	$json = webcall("updateIssue.pl", "issueId=4", "workspaceId=100", "findingIds[]=4", "findingIds[]=3", "findingIds[]=2");

	# Can we unlink an issue
	$json = webcall("updateIssue.pl", "issueId=4", "workspaceId=100", "findingIdsRemove[]=4");
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 4, "Correct number of records"); $tests++;
	is(@{$$json[3]->{findings}}, 3, "number of linked findings ok"); $tests++;
	is($$json[3]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[1]->{id}, 2, "linked finding ok"); $tests++;
	is($$json[3]->{findings}[2]->{id}, 3, "linked finding ok"); $tests++;

	# Can we unlink multiple issues
	$json = webcall("updateIssue.pl", "issueId=4", "workspaceId=100", "findingIdsRemove[]=2", "findingIdsRemove[]=3");
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 4, "Correct number of records"); $tests++;
	is(@{$$json[3]->{findings}}, 1, "number of linked findings ok"); $tests++;
	is($$json[3]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;

	# Shouldn't be able to unlink an issue that isn't linked
	$json = webcall("updateIssue.pl", "issueId=4", "workspaceId=100", "findingIdsRemove[]=4");
	# OK, time to read them back...
	$json = webcall("getIssues.pl", "workspaceId=100");
	is(@$json, 4, "Correct number of records"); $tests++;
	is(@{$$json[3]->{findings}}, 1, "number of linked findings ok"); $tests++;
	is($$json[3]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;
	
	# Lets get a single issue
	$json = webcall("getIssues.pl", "workspaceId=100", "issueId=4");
	is(@$json, 1, "Correct number of records"); $tests++;
	is($$json[0]->{id}, 4, "Correct ID fetched"); $tests++;
	is(@{$$json[0]->{findings}}, 1, "number of linked findings ok"); $tests++;
	is($$json[0]->{findings}[0]->{id}, 1, "linked finding ok"); $tests++;

	# Lets get a non-existant issue
	$json = webcall("getIssues.pl", "workspaceId=101", "issueId=4");
	is(@$json, 0, "Correct number of records"); $tests++;

	# Prep a more full GUI
	$json = webcall("updateIssue.pl", "issueId=4", "workspaceId=100", "findingIds[]=4", "findingIds[]=3", "findingIds[]=2");
	$json = webcall("updateIssue.pl", "issueId=3", "workspaceId=100", "findingIds[]=4", "findingIds[]=3");
	$json = webcall("updateFindings.pl", "ids[]=2", "ids[3]", "attrs[remark]=No+issue", "attrs[status]=4", "attrs[workspaceId]=100");

	# Link two findings to more then one issue
	$json = webcall("getFindings.pl", "workspaceId=100");
	is(@$json, 7, "Correct number of records"); $tests++;
	is($$json[0]->{id}, 1, "Correct ID fetched"); $tests++;
	is(@{$$json[0]->{issues}}, 1, "Correct number of issues"); $tests++;
	is($$json[0]->{issues}[0]->{id}, 4, "Correct issue"); $tests++;
	is($$json[1]->{id}, 2, "Correct ID fetched"); $tests++;
	is(@{$$json[1]->{issues}}, 1, "Correct number of issues"); $tests++;
	is($$json[1]->{issues}[0]->{id}, 4, "Correct issue"); $tests++;
	is($$json[2]->{id}, 3, "Correct ID fetched"); $tests++;
	is(@{$$json[2]->{issues}}, 2, "Correct number of issues"); $tests++;
	is($$json[2]->{issues}[0]->{id}, 3, "Correct issue"); $tests++;
	is($$json[2]->{issues}[1]->{id}, 4, "Correct issue"); $tests++;
	is($$json[3]->{id}, 4, "Correct ID fetched"); $tests++;
	is(@{$$json[3]->{issues}}, 2, "Correct number of issues"); $tests++;
	is($$json[3]->{issues}[0]->{id}, 3, "Correct issue"); $tests++;
	is($$json[3]->{issues}[1]->{id}, 4, "Correct issue"); $tests++;

	# Test if the correct filter is returned
	$json = webcall("getFilters.pl", "workspaceId=100", "scanIds[]=1");
	ok($json->{issue}, "Should have an issue attribute in response"); $tests++;
	is(@{$json->{issue}}, 6, "Correct number of items"); $tests++;
	is($json->{issue}[0]->{name}, '*', "Correct issue name"); $tests++;
	is($json->{issue}[0]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[0]->{number}, 7, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[1]->{name}, 'test3 (SEC-3)', "Correct issue name"); $tests++;
	is($json->{issue}[1]->{value}, 3, "Correct issue id"); $tests++;
	is($json->{issue}[1]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[1]->{number}, 2, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[2]->{name}, 'test4 (SEC-4)', "Correct issue name"); $tests++;
	is($json->{issue}[2]->{value}, 4, "Correct issue id"); $tests++;
	is($json->{issue}[2]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[2]->{number}, 4, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[3]->{name}, '---', "Correct issue name"); $tests++;
	is($json->{issue}[3]->{selected}, undef,"Issue select value ok"); $tests++;
	is($json->{issue}[3]->{number}, -1, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[4]->{name}, 'test2 (SEC-2)', "Correct issue name"); $tests++;
	is($json->{issue}[4]->{value}, 1, "Correct issue id"); $tests++;
	is($json->{issue}[4]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[4]->{number}, 0, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[5]->{name}, 'test1 (SEC-1)', "Correct issue name"); $tests++;
	is($json->{issue}[5]->{value}, 2, "Correct issue id"); $tests++;
	is($json->{issue}[5]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[5]->{number}, 0, "Correct number of findings linked"); $tests++;	
	
	# Test if the correct filter is returned filter on issue 3
	$json = webcall("getFilters.pl", "workspaceId=100", "scanIds[]=1", "Issue=3");
	ok($json->{issue}, "Should have an issue attribute in response"); $tests++;
	is(@{$json->{issue}}, 6, "Correct number of items"); $tests++;
	is($json->{issue}[0]->{name}, '*', "Correct issue name"); $tests++;
	is($json->{issue}[0]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[0]->{number}, 7, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[1]->{name}, 'test3 (SEC-3)', "Correct issue name"); $tests++;
	is($json->{issue}[1]->{value}, 3, "Correct issue id"); $tests++;
	is($json->{issue}[1]->{selected}, 1,"Issue select value ok"); $tests++;
	is($json->{issue}[1]->{number}, 2, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[2]->{name}, 'test4 (SEC-4)', "Correct issue name"); $tests++;
	is($json->{issue}[2]->{value}, 4, "Correct issue id"); $tests++;
	is($json->{issue}[2]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[2]->{number}, 4, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[3]->{name}, '---', "Correct issue name"); $tests++;
	is($json->{issue}[3]->{selected}, undef,"Issue select value ok"); $tests++;
	is($json->{issue}[3]->{number}, -1, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[4]->{name}, 'test2 (SEC-2)', "Correct issue name"); $tests++;
	is($json->{issue}[4]->{value}, 1, "Correct issue id"); $tests++;
	is($json->{issue}[4]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[4]->{number}, 0, "Correct number of findings linked"); $tests++;	
	is($json->{issue}[5]->{name}, 'test1 (SEC-1)', "Correct issue name"); $tests++;
	is($json->{issue}[5]->{value}, 2, "Correct issue id"); $tests++;
	is($json->{issue}[5]->{selected}, 0,"Issue select value ok"); $tests++;
	is($json->{issue}[5]->{number}, 0, "Correct number of findings linked"); $tests++;	
	is($json->{host}[0]->{number}, 2, "Correct number of findings in host filter"); $tests++;
	is($json->{hostname}[0]->{number}, 2, "Correct number of findings in hostname filter"); $tests++;
	is($json->{port}[0]->{number}, 2, "Correct number of findings in port filter"); $tests++;
	is($json->{plugin}[0]->{number}, 2, "Correct number of findings in plugin filter"); $tests++;
	is($json->{severity}[0]->{number}, 2, "Correct number of findings in severity filter"); $tests++;
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
