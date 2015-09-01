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
my $tests = 0;

if (`hostname` =~ /^sbpd/) {
	use Test::More tests => 1;
	ok("Skipping these tests on the final build system");
} else {
	use Test::More tests => 60;
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
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
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
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-BBBBBBB.ivil.xml`;
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
	ok($$json[0]->{statusName} eq 'New', "Status[1] ($$json[0]->{statusName}) is New, after load BBBBBBB");
	ok($$json[1]->{statusName} eq 'Changed', "Status[2] ($$json[1]->{statusName}) is Changed, after load BBBBBBB");
	ok($$json[2]->{statusName} eq 'Changed', "Status[3] ($$json[2]->{statusName}) is Changed, after load BBBBBBB");
	ok($$json[3]->{statusName} eq 'Changed', "Status[4] ($$json[3]->{statusName}) is Changed, after load BBBBBBB");
	ok($$json[4]->{statusName} eq 'New', "Status[5] ($$json[4]->{statusName}) is New, after load BBBBBBB");
	ok($$json[5]->{statusName} eq 'New', "Status[6] ($$json[5]->{statusName}) is New, after load BBBBBBB");
	ok($$json[6]->{statusName} eq 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after load BBBBBBB");

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

	# Loading none - 54-60
	`perl -MSeccubusV2 -I SeccubusV2 bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-none.ivil.xml`;
	$json = decodeit(`perl -MSeccubusV2 -I SeccubusV2 json/getFindings.pl workspaceId=100 scanIds[]=1`);
	ok($$json[0]->{statusName} eq 'Gone', "Status[1] ($$json[0]->{statusName}) is Gone, after load none");
	ok($$json[1]->{statusName} eq 'Gone', "Status[2] ($$json[1]->{statusName}) is Gone, after load none");
	ok($$json[2]->{statusName} eq 'Gone', "Status[3] ($$json[2]->{statusName}) is Gone, after load none");
	ok($$json[3]->{statusName} eq 'Gone', "Status[4] ($$json[3]->{statusName}) is Gone, after load none");
	ok($$json[4]->{statusName} eq 'Gone', "Status[5] ($$json[4]->{statusName}) is Gone, after load none");
	ok($$json[5]->{statusName} eq 'Closed', "Status[6] ($$json[5]->{statusName}) is Closed, after load none");
	ok($$json[6]->{statusName} eq 'MASKED', "Status[7] ($$json[6]->{statusName}) is MASKED, after load none");

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