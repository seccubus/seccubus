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
use Mojo::Base -strict;

use strict;

use lib "lib";

use Test::More;
use Test::Mojo;
use Data::Dumper;
use Algorithm::Diff qw( diff );

my $db_version = 0;
foreach my $data_file (<../db/data_v*.mysql>) {
    $data_file =~ /^\.\.\/db\/data_v(\d+)\.mysql$/;
    $db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -uroot -e "drop database seccubus"`;
`mysql -uroot -e "create database seccubus"`;
`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
`mysql -uroot -e "flush privileges;"`;
`mysql -uroot seccubus < ../db/structure_v$db_version.mysql`;
`mysql -uroot seccubus < ../db/data_v$db_version.mysql`;

my $t = Test::Mojo->new('Seccubus');

pass("Importing ssllabs-seccubus scan");
`bin/load_ivil -w findings -s seccubus -t 20170101000000 --scanner SSLlabs testdata/ssllabs-seccubus.ivil.xml`;

$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=1')
    ->status_is(200)
    ;
my $scan1 = $t->{tx}->res()->json();
is(@$scan1,97,"97 Elements returned");

# Update first 25 findings
my @ids = ( 1..25 );
$t->put_ok('/workspace/100/findings' => json => { ids => \@ids, status => 4, remark => "Setting to open" })
    ->status_is(200)
    ->json_is(\@ids)
    ;

# Check parameter checking
$t->get_ok('/workspace/a/finding/1/history')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

$t->get_ok('/workspace/100/finding/a/history')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# First 25 findings should have 2 history records
for my $x (1..25) {
    $t->get_ok("/workspace/100/finding/$x/history")
        ->status_is(200)
        ->json_is('/0/status',4)
        ->json_is('/1/status',1)
        ->json_hasnt('/2')
        ;
}

# Other findings should have 1 history records
for my $x (26..97) {
   $t->get_ok("/workspace/100/finding/$x/history")
        ->status_is(200)
        ->json_is('/0/status',1)
        ->json_hasnt('/1')
        ;
}

done_testing();

exit;

my $json = {};
{


	# TODO: Need to test this with assets too

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


sub webcall(@) {
	my $call = shift;

	my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/$call ";
	$cmd .= join " ", @_;
	my @result = split /\r?\n/, `$cmd`;
	while ( shift @result ) {};
	return decode_json(join "\n", @result);
}
