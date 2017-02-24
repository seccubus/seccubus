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
use SeccubusV2;
use SeccubusWorkspaces;
use SeccubusScans;
use SeccubusRuns;
use SeccubusFindings;

my $tests = 0;

sub decodeit(@);

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

my $json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/ConfigTest.pl`);
foreach my $t ( @$json ) {
	if ( $t->{name} ne "Configuration file" ) { # Skip in container
		ok($t->{result} eq "OK", "$t->{name} ($t->{result}) eq OK?");
		$tests++;			
	}
}

pass("*** Loading none into an empty system"); $tests++;
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010001 -w test -s ab --scanner Nessus6 testdata/delta-none.ivil.xml`;
my $workspaces = get_workspaces();
is(@$workspaces,'0',"There should be no workspaces after loading an empty ivil file" ); $tests++;

pass("*** Loading AB into an empty system"); $tests++;
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010002 -w test -s ab --scanner Nessus6 testdata/ab.ivil.xml`;
my $workspaces = get_workspaces();
is(@$workspaces,'1',"There should be a workspaces after loading AB" ); $tests++;
is($$workspaces[0][0],100,"Workspace id is 100"); $tests++;
is($$workspaces[0][1],"test","Workspace is called test"); $tests++;
my $scans = get_scans(100);
is(@$scans,1,"There is one scan in the workspace"); $tests++;
is($$scans[0][0],1,"scan id is 1"); $tests++;
is($$scans[0][1],"ab","name is ab"); $tests++;
my $runs = get_runs(100,1);
is(@$runs,1,"There is 1 run"); $tests++;
my $findings = get_findings(100);
is(@$findings,2,"There are 2 findings"); $tests++;
is($$findings[0][5],"A","Finding 1 is A"); $tests++;
is($$findings[0][10],"New","Finding 1 status is New"); $tests++;
is($$findings[1][5],"B","Finding 2 is B"); $tests++;
is($$findings[1][10],"New","Finding 2 status is New"); $tests++;

pass("*** Loading none into the same scan"); $tests++;
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010003 -w test -s ab --scanner Nessus6 testdata/delta-none.ivil.xml`;
my $workspaces = get_workspaces();
is(@$workspaces,'1',"There should still be only one workspace" ); $tests++;
is($$workspaces[0][0],100,"Workspace id is 100"); $tests++;
is($$workspaces[0][1],"test","Workspace is called test"); $tests++;
my $scans = get_scans(100);
is(@$scans,1,"There is one scan in the workspace"); $tests++;
is($$scans[0][0],1,"scan id is 1"); $tests++;
is($$scans[0][1],"ab","name is ab"); $tests++;
my $runs = get_runs(100,1);
is(@$runs,1,"There is 1 run"); $tests++;
my $findings = get_findings(100);
is(@$findings,2,"There are 2 findings"); $tests++;
is($$findings[0][5],"A","Finding 1 is A"); $tests++;
is($$findings[0][10],"New","Finding 1 status is New"); $tests++;
is($$findings[1][5],"B","Finding 2 is B"); $tests++;
is($$findings[1][10],"New","Finding 2 status is New"); $tests++;

pass("*** Loading none into a new scan"); $tests++;
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010004 -w test -s ba --scanner Nessus6 testdata/delta-none.ivil.xml`;
my $workspaces = get_workspaces();
is(@$workspaces,'1',"There should still be only one workspace" ); $tests++;
is($$workspaces[0][0],100,"Workspace id is 100"); $tests++;
is($$workspaces[0][1],"test","Workspace is called test"); $tests++;
my $scans = get_scans(100);
is(@$scans,1,"There is one scan in the workspace"); $tests++;
is($$scans[0][0],1,"scan id is 1"); $tests++;
is($$scans[0][1],"ab","name is ab"); $tests++;
my $runs = get_runs(100,1);
is(@$runs,1,"There is 1 run"); $tests++;
my $findings = get_findings(100);
is(@$findings,2,"There are 2 findings"); $tests++;
is($$findings[0][5],"A","Finding 1 is A"); $tests++;
is($$findings[0][10],"New","Finding 1 status is New"); $tests++;
is($$findings[1][5],"B","Finding 2 is B"); $tests++;
is($$findings[1][10],"New","Finding 2 status is New"); $tests++;

pass("*** Loading none into the same scan with --allowempty"); $tests++;
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010005 -w test -s ab --scanner Nessus6 --allowempty testdata/delta-none.ivil.xml`;
my $workspaces = get_workspaces();
is(@$workspaces,'1',"There should still be only one workspace" ); $tests++;
is($$workspaces[0][0],100,"Workspace id is 100"); $tests++;
is($$workspaces[0][1],"test","Workspace is called test"); $tests++;
my $scans = get_scans(100);
is(@$scans,1,"There is one scan in the workspace"); $tests++;
is($$scans[0][0],1,"scan id is 1"); $tests++;
is($$scans[0][1],"ab","name is ab"); $tests++;
my $runs = get_runs(100,1);
is(@$runs,2,"There are 2 runs"); $tests++;
my $findings = get_findings(100);
is(@$findings,2,"There are 2 findings"); $tests++;
is($$findings[0][5],"A","Finding 1 is A"); $tests++;
is($$findings[0][10],"Gone","Finding 1 status is New"); $tests++;
is($$findings[1][5],"B","Finding 2 is B"); $tests++;
is($$findings[1][10],"Gone","Finding 2 status is New"); $tests++;

pass("*** Loading none into the a new scan with --allowempty"); $tests++;
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010006 -w test -s ba --scanner Nessus6 --allowempty testdata/delta-none.ivil.xml`;
my $workspaces = get_workspaces();
is(@$workspaces,'1',"There should still be only one workspace" ); $tests++;
is($$workspaces[0][0],100,"Workspace id is 100"); $tests++;
is($$workspaces[0][1],"test","Workspace is called test"); $tests++;
my $scans = get_scans(100);
is(@$scans,2,"There are two scans in the workspace"); $tests++;
is($$scans[0][0],1,"scan id is 1"); $tests++;
is($$scans[0][1],"ab","name is ab"); $tests++;
is($$scans[1][0],2,"scan id is 2"); $tests++;
is($$scans[1][1],"ba","name is ba"); $tests++;
my $runs = get_runs(100,2);
is(@$runs,1,"There is 1 run"); $tests++;
my $findings = get_findings(100,2);
is(@$findings,0,"There are 0 findings in scan 2"); $tests++;

done_testing($tests);

sub decodeit(@) {
	my $line = 1;
	while( $line ) {
		$line = shift;
		$line =~ s/\r?\n//;
	}
	return decode_json(join "\n", @_);
}