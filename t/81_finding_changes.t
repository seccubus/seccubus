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
use Mojo::Base -strict;

use strict;

use Test::More;
use Test::Mojo;
use Data::Dumper;

use lib "lib";

use SeccubusV2;
use Seccubus::Findings;

my $db_version = 0;
foreach my $data_file (glob "db/data_v*.mysql") {
    $data_file =~ /^db\/data_v(\d+)\.mysql$/;
    $db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -h 127.0.0.1 -u root -e "drop database seccubus"`;
`mysql -h 127.0.0.1 -u root -e "create database seccubus"`;
`mysql -h 127.0.0.1 -u root -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
`mysql -h 127.0.0.1 -u root -e "flush privileges;"`;
`mysql -h 127.0.0.1 -u root seccubus < db/structure_v$db_version.mysql`;
`mysql -h 127.0.0.1 -u root seccubus < db/data_v$db_version.mysql`;

my $t = Test::Mojo->new('Seccubus');

# Log in
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin', "content-type" => "application/json" })
    ->status_is(200,"Login ok")
;

`bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
is($?,0,"Command executed ok");

foreach my $id ( 1..7 ) {
    $t->get_ok("/api/workspace/100/finding/$id/history")
        ->status_is(200)
        ->json_hasnt("/1","Finding $id only has one history record")
        ->json_is("/0/user", "importer", "Change is made by user importer")
    ;
}

# We need a new timestamp
sleep 1;

# Loading AAAAAAA-changes
`bin/load_ivil -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA-changes.ivil.xml`;
is($?,0,"Command executed ok");
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_has("/6")
    ->json_hasnt("/7")
;
foreach my $id ( (1..3) ) {
    $t->get_ok("/api/workspace/100/finding/$id/history")
        ->status_is(200)
    ;
    if ( $id == 1 ) {
        $t  ->json_is("/0/severity",3,"Severity was changed")
            ->json_is("/1/severity",2,"Severity was preserved")
            ->json_is("/0/finding","A","Finding wasn't changed in record 1")
            ->json_is("/1/finding","A","Finding wasn't changed in record 2")
        ;
    } elsif ( $id == 2 ) {
        $t  ->json_is("/0/finding","B","Finding was changed")
            ->json_is("/1/finding","A","Finding was preserved")
            ->json_is("/0/severity",2,"Severity wasn't changed in record 1")
            ->json_is("/1/severity",2,"Severity wasn't changed in record 2")
        ;
    } elsif ( $id == 3 ) {
        $t  ->json_is("/0/severity",3,"Severity was changed")
            ->json_is("/1/severity",2,"Severity was preserved")
            ->json_is("/0/finding","B","Finding was changed")
            ->json_is("/1/finding","A","Finding was preserved")
        ;
    }
}

foreach my $id ( 4..7 ) {
    $t->get_ok("/api/workspace/100/finding/$id/history")
        ->status_is(200)
        ->json_is("/0/user","importer","Change 1 is made by importer")
        ->json_is("/1/user","importer","Change 2 is made by importer")
        ->json_is("/0/finding","A","Finding wasn't changed in record 1")
        ->json_is("/1/finding","A","Finding wasn't changed in record 2")
        ->json_is("/0/severity",2,"Severity wasn't changed in record 1")
        ->json_is("/1/severity",2,"Severity wasn't changed in record 2")
    ;
}

$t->put_ok('/api/workspace/100/finding/4', json => { status => 1 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/5', json => { status => 2 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/6', json => { status => 1, remark => "test" })->status_is(200);
$t->put_ok('/api/workspace/100/finding/7', json => { status => 2, remark => "test" })->status_is(200);

foreach my $id ( 1..4 ) {
    $t->get_ok("/api/workspace/100/finding/$id/history")
        ->status_is(200)
        ->json_has("/1")
        ->json_hasnt("/2")
    ;
}
foreach my $id ( 5..7 ) {
    $t->get_ok("/api/workspace/100/finding/$id/history")
        ->status_is(200)
        ->json_has("/2")
        ->json_hasnt("/3")
        ->json_is("/1/user","importer","Change 2 is made by importer")
        ->json_is("/2/user","importer","Change 3 is made by importer")
        ->json_is("/0/finding","A","Finding wasn't changed in record 1")
        ->json_is("/1/finding","A","Finding wasn't changed in record 2")
        ->json_is("/2/finding","A","Finding wasn't changed in record 3")
        ->json_is("/0/severity",2,"Severity wasn't changed in record 1")
        ->json_is("/1/severity",2,"Severity wasn't changed in record 2")
        ->json_is("/2/severity",2,"Severity wasn't changed in record 4")
    ;
    if ( $id == 5 ) {
        $t->json_is("/0/status",2,"Status was changed in record 1");
        $t->json_is("/1/status",1,"Status was preserved in record 2");
        $t->json_is("/2/status",1,"Status was preserved in record 3");
        $t->json_is("/0/remark",undef,"Remark was preserved in record 1");
        $t->json_is("/1/remark",undef,"Remark was preserved in record 2");
        $t->json_is("/2/remark",undef,"Remark was preserved in record 3");
    } elsif ( $id == 6 ) {
        $t->json_is("/0/status",1,"Status was preserved in record 1");
        $t->json_is("/1/status",1,"Status was preserved in record 2");
        $t->json_is("/2/status",1,"Status was preserved in record 3");
        $t->json_is("/0/remark","test","Remark was changed in record 1");
        $t->json_is("/1/remark",undef,"Remark was preserved in record 2");
        $t->json_is("/2/remark",undef,"Remark was preserved in record 3");
    } elsif ( $id == 7 ) {
        $t->json_is("/0/status",2,"Status was changed in record 1");
        $t->json_is("/1/status",1,"Status was preserved in record 2");
        $t->json_is("/2/status",1,"Status was preserved in record 3");
        $t->json_is("/0/remark","test","Remark was changed in record 1");
        $t->json_is("/1/remark",undef,"Remark was preserved in record 2");
        $t->json_is("/2/remark",undef,"Remark was preserved in record 3");
    }
}

$t->get_ok("/api/workspace/100/findings")
    ->status_is(200)
;
foreach my $f ( @{$t->{tx}->res()->json()} ) {
    $t->get_ok("/api/workspace/100/finding/$f->{id}/history")
        ->status_is(200)
    ;
    foreach my $key ( qw(finding severity status remark run) ) {
        my $hkey = $key;
        $hkey = "find" if $key eq "finding";
        $t->json_is("/0/$key",$f->{$hkey},"Field $key of history record 0 equals the finding");
    }
}

done_testing();
