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

my $t = Test::Mojo->new('Seccubus');

# Log in
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin', "content-type" => "application/json" })
    ->status_is(200,"Login ok")
;

pass("Importing ssllabs-seccubus scan");
`bin/load_ivil -w findings -s seccubus -t 20170101000000 --scanner SSLlabs testdata/ssllabs-seccubus.ivil.xml`;

$t->get_ok('/api/workspace/100/findings?Limit=-1&scanIds[]=1')
    ->status_is(200)
    ;
my $scan1 = $t->{tx}->res()->json();
is(@$scan1,97,"97 Elements returned");

# Update first 25 findings
my @ids = ( 1..25 );
$t->put_ok('/api/workspace/100/findings' => json => { ids => \@ids, status => 4, remark => "Setting to open" })
    ->status_is(200)
    ->json_is(\@ids)
    ;

# Check parameter checking
$t->get_ok('/api/workspace/a/finding/1/history')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

$t->get_ok('/api/workspace/100/finding/a/history')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# First 25 findings should have 2 history records
for my $x (1..25) {
    $t->get_ok("/api/workspace/100/finding/$x/history")
        ->status_is(200)
        ->json_is('/0/status',4)
        ->json_is('/1/status',1)
        ->json_hasnt('/2')
        ;
}

# Other findings should have 1 history records
for my $x (26..97) {
   $t->get_ok("/api/workspace/100/finding/$x/history")
        ->status_is(200)
        ->json_is('/0/status',1)
        ->json_hasnt('/1')
        ;
}

done_testing();

exit;

