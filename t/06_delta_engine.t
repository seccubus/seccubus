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
use SeccubusFindings;

sub decodeit(@);

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

my $json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/ConfigTest.pl`);
foreach my $t ( @$json ) {
	if ( $t->{name} ne "Configuration file" ) { # Skip in container
		ok($t->{result} eq "OK", "$t->{name} ($t->{result}) eq OK?");
	}
}

# Loading AAAAAAA - 12-18
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010001 -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[0]->{statusName} eq 'New', "Status[1] ($$json[0]->{statusName}) is New, after load AAAAAAA");
ok($$json[1]->{statusName} eq 'New', "Status[2] ($$json[1]->{statusName}) is New, after load AAAAAAA");
ok($$json[2]->{statusName} eq 'New', "Status[3] ($$json[2]->{statusName}) is New, after load AAAAAAA");
ok($$json[3]->{statusName} eq 'New', "Status[4] ($$json[3]->{statusName}) is New, after load AAAAAAA");
ok($$json[4]->{statusName} eq 'New', "Status[5] ($$json[4]->{statusName}) is New, after load AAAAAAA");
ok($$json[5]->{statusName} eq 'New', "Status[6] ($$json[5]->{statusName}) is New, after load AAAAAAA");
ok($$json[6]->{statusName} eq 'New', "Status[7] ($$json[6]->{statusName}) is New, after load AAAAAAA");

# Set to all possible statusses 19-26
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=2 attrs[remark]= attrs[status]=2 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=3 attrs[remark]= attrs[status]=3 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=4 attrs[remark]= attrs[status]=4 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=5 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=6 attrs[remark]= attrs[status]=6 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=7 attrs[remark]= attrs[status]=99 attrs[workspaceId]=100`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[0]->{statusName} eq 'New', "Status[1] ($$json[0]->{statusName}) is New, after reset");
ok($$json[1]->{statusName} eq 'Changed', "Status[2] ($$json[1]->{statusName}) is Changed, after reset");
ok($$json[2]->{statusName} eq 'Open', "Status[3] ($$json[2]->{statusName}) is Open, after reset");
ok($$json[3]->{statusName} eq 'No issue', "Status[4] ($$json[3]->{statusName}) is No issue, after reset");
ok($$json[4]->{statusName} eq 'Gone', "Status[5] ($$json[4]->{statusName}) is Gone, after reset");
ok($$json[5]->{statusName} eq 'Closed', "Status[6] ($$json[5]->{statusName}) is Closed, after reset");
ok($$json[6]->{statusName} eq 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after reset");

# Loading AAAAAAA - 27-32
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010002 -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[0]->{statusName} eq 'New', "Status[1] ($$json[0]->{statusName}) is New, after load AAAAAAA");
ok($$json[1]->{statusName} eq 'Changed', "Status[2] ($$json[1]->{statusName}) is Changed, after load AAAAAAA");
ok($$json[2]->{statusName} eq 'Open', "Status[3] ($$json[2]->{statusName}) is Open, after load AAAAAAA");
ok($$json[3]->{statusName} eq 'No issue', "Status[4] ($$json[3]->{statusName}) is No issue, after load AAAAAAA");
ok($$json[4]->{statusName} eq 'New', "Status[5] ($$json[4]->{statusName}) is New, after load AAAAAAA");
ok($$json[5]->{statusName} eq 'New', "Status[6] ($$json[5]->{statusName}) is New, after load AAAAAAA");
ok($$json[6]->{statusName} eq 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after load AAAAAAA");

# Set to all possible statusses 33-39
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=2 attrs[remark]= attrs[status]=2 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=3 attrs[remark]= attrs[status]=3 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=4 attrs[remark]= attrs[status]=4 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=5 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=6 attrs[remark]= attrs[status]=6 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=7 attrs[remark]= attrs[status]=99 attrs[workspaceId]=100`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[0]->{statusName} eq 'New', "Status[1] ($$json[0]->{statusName}) is New, after reset");
ok($$json[1]->{statusName} eq 'Changed', "Status[2] ($$json[1]->{statusName}) is Changed, after reset");
ok($$json[2]->{statusName} eq 'Open', "Status[3] ($$json[2]->{statusName}) is Open, after reset");
ok($$json[3]->{statusName} eq 'No issue', "Status[4] ($$json[3]->{statusName}) is No issue, after reset");
ok($$json[4]->{statusName} eq 'Gone', "Status[5] ($$json[4]->{statusName}) is Gone, after reset");
ok($$json[5]->{statusName} eq 'Closed', "Status[6] ($$json[5]->{statusName}) is Closed, after reset");
ok($$json[6]->{statusName} eq 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after reset");

# Loading BBBBBBB - 40-46
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010003 -w test -s ab --scanner Nessus6 testdata/delta-BBBBBBB.ivil.xml`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[0]->{statusName} eq 'New', "Status[1] ($$json[0]->{statusName}) is New, after load BBBBBBB");
ok($$json[1]->{statusName} eq 'Changed', "Status[2] ($$json[1]->{statusName}) is Changed, after load BBBBBBB");
ok($$json[2]->{statusName} eq 'Changed', "Status[3] ($$json[2]->{statusName}) is Changed, after load BBBBBBB");
ok($$json[3]->{statusName} eq 'Changed', "Status[4] ($$json[3]->{statusName}) is Changed, after load BBBBBBB");
ok($$json[4]->{statusName} eq 'New', "Status[5] ($$json[4]->{statusName}) is New, after load BBBBBBB");
ok($$json[5]->{statusName} eq 'New', "Status[6] ($$json[5]->{statusName}) is New, after load BBBBBBB");
ok($$json[6]->{statusName} eq 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after load BBBBBBB");

#
# Handling of Gone (Status before gone)
#

# Set to all possible statusses 47-53
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=2 attrs[remark]= attrs[status]=2 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=3 attrs[remark]= attrs[status]=3 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=4 attrs[remark]= attrs[status]=4 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=5 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=6 attrs[remark]= attrs[status]=6 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=7 attrs[remark]= attrs[status]=99 attrs[workspaceId]=100`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[0]->{statusName} eq 'New', "Status[1] ($$json[0]->{statusName}) is New, after reset");
ok($$json[1]->{statusName} eq 'Changed', "Status[2] ($$json[1]->{statusName}) is Changed, after reset");
ok($$json[2]->{statusName} eq 'Open', "Status[3] ($$json[2]->{statusName}) is Open, after reset");
ok($$json[3]->{statusName} eq 'No issue', "Status[4] ($$json[3]->{statusName}) is No issue, after reset");
ok($$json[4]->{statusName} eq 'Gone', "Status[5] ($$json[4]->{statusName}) is Gone, after reset");
ok($$json[5]->{statusName} eq 'Closed', "Status[6] ($$json[5]->{statusName}) is Closed, after reset");
ok($$json[6]->{statusName} eq 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after reset");

sleep 5; # Make sure timestamp is different

# Loading none - 53-59
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010004 -w test -s ab --scanner Nessus6 testdata/delta-none.ivil.xml --allowempty`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[0]->{statusName} eq 'Gone', "Status[1] ($$json[0]->{statusName}) is Gone, after load none");
ok($$json[1]->{statusName} eq 'Gone', "Status[2] ($$json[1]->{statusName}) is Gone, after load none");
ok($$json[2]->{statusName} eq 'Gone', "Status[3] ($$json[2]->{statusName}) is Gone, after load none");
ok($$json[3]->{statusName} eq 'Gone', "Status[4] ($$json[3]->{statusName}) is Gone, after load none");
ok($$json[4]->{statusName} eq 'Gone', "Status[5] ($$json[4]->{statusName}) is Gone, after load none");
ok($$json[5]->{statusName} eq 'Closed', "Status[6] ($$json[5]->{statusName}) is Closed, after load none");
ok($$json[6]->{statusName} eq 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after load none");

# Hard set 6 and 7 to Gone too
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=6 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=7 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;
# Create a new Gone finding
update_finding(
	workspace_id => 100,
	scan_id => 1,
	run_id => 4,
	host => 'A',
	port => '80/tcp',
	plugin => '8',
	finding => 'B',
	severity => 2,
	status => 5
);
# Validate 60 - 62
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[5]->{statusName} eq 'Gone', "Status[6] ($$json[5]->{statusName}) is Gone after setting it the hard way");
ok($$json[6]->{statusName} eq 'Gone', "Status[7] ($$json[6]->{statusName}) is Gone after setting it the hard way");
ok($$json[7]->{statusName} eq 'Gone', "Status[8] ($$json[7]->{statusName}) is Gone after creating it the hard way");

sleep 5; # Make sure timestamp is different

# Load BBBBBBBB - 63-70
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010005 -w test -s ab --scanner Nessus6 testdata/delta-BBBBBBBB.ivil.xml`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
is($$json[0]->{statusName}, 'New', "Status[1] ($$json[0]->{statusName}) is New, Status before gone is new");
is($$json[1]->{statusName}, 'Changed', "Status[2] ($$json[1]->{statusName}) is Changed, Status before gone is changed");
is($$json[2]->{statusName}, 'New', "Status[3] ($$json[2]->{statusName}) is New, Status before gone is Open, after load BBBBBBB again");
is($$json[3]->{statusName}, 'No issue', "Status[4] ($$json[3]->{statusName}) is No issue, status before gone is No issue and it didn't change, after load BBBBBBB again");
is($$json[4]->{statusName}, 'New', "Status[5] ($$json[4]->{statusName}) is New, after load BBBBBBB");
is($$json[5]->{statusName}, 'New', "Status[6] ($$json[5]->{statusName}) is New, after load BBBBBBB");
is($$json[6]->{statusName}, 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after load BBBBBBB");
is($$json[7]->{statusName}, 'New', "Status[8] ($$json[7]->{statusName}) is New, there is no status before gone");

sleep 5; # Make sure timestamp is different

# Set to all possible statusses
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=1 attrs[remark]= attrs[status]=1 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=2 attrs[remark]= attrs[status]=2 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=3 attrs[remark]= attrs[status]=3 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=4 attrs[remark]= attrs[status]=4 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=5 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=6 attrs[remark]= attrs[status]=6 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=7 attrs[remark]= attrs[status]=99 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=8 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;

sleep 5; # Make sure timestamp is different

# Loading none - 71 - 78
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010006 -w test -s ab --scanner Nessus6 testdata/delta-none.ivil.xml --allowempty`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
is($$json[0]->{statusName}, 'Gone', "Status[1] ($$json[0]->{statusName}) is Gone, after load none");
is($$json[1]->{statusName}, 'Gone', "Status[2] ($$json[1]->{statusName}) is Gone, after load none");
is($$json[2]->{statusName}, 'Gone', "Status[3] ($$json[2]->{statusName}) is Gone, after load none");
is($$json[3]->{statusName}, 'Gone', "Status[4] ($$json[3]->{statusName}) is Gone, after load none");
is($$json[4]->{statusName}, 'Gone', "Status[5] ($$json[4]->{statusName}) is Gone, after load none");
is($$json[5]->{statusName}, 'Closed', "Status[6] ($$json[5]->{statusName}) is Closed, after load none");
is($$json[6]->{statusName}, 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after load none");
is($$json[7]->{statusName}, 'Gone', "Status[8] ($$json[7]->{statusName}) is Gone, after load none");

# Hard set 6 and 7 to Gone too
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=6 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;
`perl -MSeccubusV2 -I SeccubusV2 json/updateFindings.pl ids[]=7 attrs[remark]= attrs[status]=5 attrs[workspaceId]=100`;
# Create a new Gone finding
update_finding(
	workspace_id => 100,
	scan_id => 1,
	run_id => 4,
	host => 'A',
	port => '80/tcp',
	plugin => '9',
	finding => 'B',
	severity => 2,
	status => 5
);
# Validate 79 - 81
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
ok($$json[5]->{statusName} eq 'Gone', "Status[6] ($$json[5]->{statusName}) is Gone after setting it the hard way");
ok($$json[6]->{statusName} eq 'Gone', "Status[7] ($$json[6]->{statusName}) is Gone after setting it the hard way");
ok($$json[8]->{statusName} eq 'Gone', "Status[9] ($$json[7]->{statusName}) is Gone after creating it the hard way");

sleep 5; # Make sure timestamp is different

# Load AAAAAAAAA 82 -
`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -t 201701010007 -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAAAA.ivil.xml`;
$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
is($$json[0]->{statusName}, 'New', "Status[1] ($$json[0]->{statusName}) is New, Status before gone is new");
is($$json[1]->{statusName}, 'Changed', "Status[2] ($$json[1]->{statusName}) is Changed, Status before gone is changed");
is($$json[2]->{statusName}, 'New', "Status[3] ($$json[2]->{statusName}) is New, Status before gone is Open, after AAA");
is($$json[3]->{statusName}, 'Changed', "Status[4] ($$json[3]->{statusName}) is Changed, status before gone is No issdue and it didn't change, after AAA");
is($$json[4]->{statusName}, 'New', "Status[5] ($$json[4]->{statusName}) is New, after load BBBBBBB");
is($$json[5]->{statusName}, 'New', "Status[6] ($$json[5]->{statusName}) is New, after load BBBBBBB");
is($$json[6]->{statusName}, 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after load BBBBBBB");
is($$json[7]->{statusName}, 'New', "Status[8] ($$json[7]->{statusName}) is New, Status before gone is new");
is($$json[8]->{statusName}, 'New', "Status[9] ($$json[8]->{statusName}) is New, there is no status before gone");

done_testing();

sub decodeit(@) {
	my $line = 1;
	while( $line ) {
		$line = shift;
		$line =~ s/\r?\n//;
	}
	return decode_json(join "\n", @_);
}