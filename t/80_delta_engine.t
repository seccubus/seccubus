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

# Loading AAAAAAA - 12-18
`bin/load_ivil -t 201701010001 -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
is($?,0,"Command executed ok");
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'New', "Status[1] is New, after load AAAAAAA")
    ->json_is("/1/statusName", 'New', "Status[2] is New, after load AAAAAAA")
    ->json_is("/2/statusName", 'New', "Status[3] is New, after load AAAAAAA")
    ->json_is("/3/statusName", 'New', "Status[4] is New, after load AAAAAAA")
    ->json_is("/4/statusName", 'New', "Status[5] is New, after load AAAAAAA")
    ->json_is("/5/statusName", 'New', "Status[6] is New, after load AAAAAAA")
    ->json_is("/6/statusName", 'New', "Status[7] is New, after load AAAAAAA")
;

# Set to all possible statusses 12-32
$t->put_ok('/api/workspace/100/finding/2', json => { status => 2 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/3', json => { status => 3 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/4', json => { status => 4 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/5', json => { status => 5 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/6', json => { status => 6 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/7', json => { status => 99 })->status_is(200);

$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'New', "Status[1] is New, after reset")
    ->json_is("/1/statusName", 'Changed', "Status[2] is Changed, after reset")
    ->json_is("/2/statusName", 'Open', "Status[3] is Open, after reset")
    ->json_is("/3/statusName", 'No issue', "Status[}) is No issue, after reset")
    ->json_is("/4/statusName", 'Gone', "Status[5] is Gone, after reset")
    ->json_is("/5/statusName", 'Closed', "Status[6] is Closed, after reset")
    ->json_is("/6/statusName", 'MASKED', "Status[7] is MASKED, after reset")
;

# Loading AAAAAAA 30-42
`bin/load_ivil -t 201701010002 -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAA.ivil.xml`;
is($?,0,"Command executed ok");
# Reactivate Mojo
$t = Test::Mojo->new('Seccubus');
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'New', "Status[1] is New, after load AAAAAAA")
    ->json_is("/1/statusName", 'Changed', "Status[2] is Changed, after load AAAAAAA")
    ->json_is("/2/statusName", 'Open', "Status[3] is Open, after load AAAAAAA")
    ->json_is("/3/statusName", 'No issue', "Status[}) is No issue, after load AAAAAAA")
    ->json_is("/4/statusName", 'New', "Status[5] is New, after load AAAAAAA")
    ->json_is("/5/statusName", 'New', "Status[6] is New, after load AAAAAAA")
    ->json_is("/6/statusName", 'MASKED', "Status[7] is MASKED, after load AAAAAAA")
;

# Set to all possible statusses 43-63
$t->put_ok('/api/workspace/100/finding/2', json => { status => 2 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/3', json => { status => 3 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/4', json => { status => 4 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/5', json => { status => 5 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/6', json => { status => 6 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/7', json => { status => 99 })->status_is(200);

$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'New', "Status[1] is New, after reset")
    ->json_is("/1/statusName", 'Changed', "Status[2] is Changed, after reset")
    ->json_is("/2/statusName", 'Open', "Status[3] is Open, after reset")
    ->json_is("/3/statusName", 'No issue', "Status[4) is No issue, after reset")
    ->json_is("/4/statusName", 'Gone', "Status[5] is Gone, after reset")
    ->json_is("/5/statusName", 'Closed', "Status[6] is Closed, after reset")
    ->json_is("/6/statusName", 'MASKED', "Status[7] is MASKED, after reset")
;

# Loading BBBBBBB - 64-73
`bin/load_ivil -t 201701010003 -w test -s ab --scanner Nessus6 testdata/delta-BBBBBBB.ivil.xml`;
is($?,0,"Command executed ok");
# Reactivate Mojo
$t = Test::Mojo->new('Seccubus');
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'New', "Status[1] is New, after load BBBBBBB")
    ->json_is("/1/statusName", 'Changed', "Status[2] is Changed, after load BBBBBBB")
    ->json_is("/2/statusName", 'Changed', "Status[3] is Changed, after load BBBBBBB")
    ->json_is("/3/statusName", 'Changed', "Status[4] is Changed, after load BBBBBBB")
    ->json_is("/4/statusName", 'New', "Status[5] is New, after load BBBBBBB")
    ->json_is("/5/statusName", 'New', "Status[6] is New, after load BBBBBBB")
    ->json_is("/6/statusName", 'MASKED', "Status[7] is MASKED, after load BBBBBBB")
;

#
# Handling of Gone (Status before gone)
#

sleep 1; # Make sure timestamp is different

# Set to all possible statusses 74-94
$t->put_ok('/api/workspace/100/finding/2', json => { status => 2 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/3', json => { status => 3 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/4', json => { status => 4 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/5', json => { status => 5 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/6', json => { status => 6 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/7', json => { status => 99 })->status_is(200);

$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'New', "Status[1] is New, after reset")
    ->json_is("/1/statusName", 'Changed', "Status[2] is Changed, after reset")
    ->json_is("/2/statusName", 'Open', "Status[3] is Open, after reset")
    ->json_is("/3/statusName", 'No issue', "Status[4}) is No issue, after reset")
    ->json_is("/4/statusName", 'Gone', "Status[5] is Gone, after reset")
    ->json_is("/5/statusName", 'Closed', "Status[6] is Closed, after reset")
    ->json_is("/6/statusName", 'MASKED', "Status[7] is MASKED, after reset")
;

sleep 1; # Make sure timestamp is different

# Loading none - 95-104
`bin/load_ivil -t 201701010004 -w test -s ab --scanner Nessus6 testdata/delta-none.ivil.xml --allowempty`;
is($?,0,"Command executed ok");
# Reactivate Mojo
$t = Test::Mojo->new('Seccubus');
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'Gone', "Status[1] is Gone, after load none")
    ->json_is("/1/statusName", 'Gone', "Status[2] is Gone, after load none")
    ->json_is("/2/statusName", 'Gone', "Status[3] is Gone, after load none")
    ->json_is("/3/statusName", 'Gone', "Status[4] is Gone, after load none")
    ->json_is("/4/statusName", 'Gone', "Status[5] is Gone, after load none")
    ->json_is("/5/statusName", 'Closed', "Status[6] is Closed, after load none")
    ->json_is("/6/statusName", 'MASKED', "Status[7] is MASKED, after load none")
;
# Hard set 6 and 7 to Gone too
$t->put_ok('/api/workspace/100/finding/6', json => { status => 5 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/7', json => { status => 5 })->status_is(200);

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
# Validate
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/5/statusName", 'Gone', "Status[6] is Gone after setting it the hard way")
    ->json_is("/6/statusName", 'Gone', "Status[7] is Gone after setting it the hard way")
    ->json_is("/7/statusName", 'Gone', "Status[8] is Gone after creating it the hard way")
;

sleep 1; # Make sure timestamp is different

# Load BBBBBBBB - 114-124
`bin/load_ivil -t 201701010005 -w test -s ab --scanner Nessus6 testdata/delta-BBBBBBBB.ivil.xml`;
is($?,0,"Command executed ok");
# Reactivate Mojo
$t = Test::Mojo->new('Seccubus');
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'New', "Status[1] is New, Status before gone is new, after load BBBBBBB")
    ->json_is("/1/statusName", 'Changed', "Status[2] is Changed, Status before gone is changed, after load BBBBBBB")
    ->json_is("/2/statusName", 'New', "Status[3] is New, Status before gone is Open, after load BBBBBBB")
    ->json_is("/3/statusName", 'No issue', "Status[4) is No issue, status before gone is No issue and it didn't change, after load BBBBBBB")
    ->json_is("/4/statusName", 'New', "Status[5] is New, after load BBBBBBB")
    ->json_is("/5/statusName", 'New', "Status[6] is New, after load BBBBBBB")
    ->json_is("/6/statusName", 'MASKED', "Status[7] is MASKED, after load BBBBBBB")
    ->json_is("/7/statusName", 'New', "Status[8] is New, there is no status before gone, after load BBBBBBB")
;

sleep 1; # Make sure timestamp is different

# Set to all possible statusses 125-140
$t->put_ok('/api/workspace/100/finding/1', json => { status => 1 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/2', json => { status => 2 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/3', json => { status => 3 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/4', json => { status => 4 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/5', json => { status => 5 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/6', json => { status => 6 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/7', json => { status => 99 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/8', json => { status => 5 })->status_is(200);

sleep 1; # Make sure timestamp is different

# Loading none - 141 - 155
`bin/load_ivil -t 201701010006 -w test -s ab --scanner Nessus6 testdata/delta-none.ivil.xml --allowempty`;
is($?,0,"Command executed ok");
# Reactivate Mojo
$t = Test::Mojo->new('Seccubus');
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'Gone', "Status[1] is Gone, after load none")
    ->json_is("/1/statusName", 'Gone', "Status[2] is Gone, after load none")
    ->json_is("/2/statusName", 'Gone', "Status[3] is Gone, after load none")
    ->json_is("/3/statusName", 'Gone', "Status[4] is Gone, after load none")
    ->json_is("/4/statusName", 'Gone', "Status[5] is Gone, after load none")
    ->json_is("/5/statusName", 'Closed', "Status[6] is Closed, after load none")
    ->json_is("/6/statusName", 'MASKED', "Status[7] is MASKED, after load none")
    ->json_is("/7/statusName", 'Gone', "Status[8] is Gone, after load none")
;
# Hard set 6 and 7 to Gone too
$t->put_ok('/api/workspace/100/finding/6', json => { status => 5 })->status_is(200);
$t->put_ok('/api/workspace/100/finding/7', json => { status => 5 })->status_is(200);
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

# Validate 155 - 160
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/5/statusName", 'Gone', "Status[6] is Gone after setting it the hard way")
    ->json_is("/6/statusName", 'Gone', "Status[7] is Gone after setting it the hard way")
    ->json_is("/8/statusName", 'Gone', "Status[9] is Gone after creating it the hard way")
;

sleep 1;

# Load AAAAAAAAA 161 -
`bin/load_ivil -t 201701010007 -w test -s ab --scanner Nessus6 testdata/delta-AAAAAAAAA.ivil.xml`;
is($?,0,"Command executed ok");
# Reactivate Mojo
$t = Test::Mojo->new('Seccubus');
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
    ->json_is("/0/statusName", 'New', "Status[1] is New, Status before gone is new, after load BBBBBBB again")
    ->json_is("/1/statusName", 'Changed', "Status[2]) is Changed, Status before gone is changed, after load BBBBBBB again")
    ->json_is("/2/statusName", 'New', "Status[3] is New, Status before gone is Open, after load BBBBBBB again")
    ->json_is("/3/statusName", 'Changed', "Status[4]) is Changed, status before gone is No issdue and it didn't change, after load BBBBBBB again")
    ->json_is("/4/statusName", 'New', "Status[5] is New, after load BBBBBBB again")
    ->json_is("/5/statusName", 'New', "Status[6] is New, after load BBBBBBB again")
    ->json_is("/6/statusName", 'MASKED', "Status[7]) is MASKED, after load BBBBBBB again")
    ->json_is("/7/statusName", 'New', "Status[8] is New, Status before gone is new, after load BBBBBBB again")
    ->json_is("/8/statusName", 'New', "Status[9] is New, there is no status before gone, after load BBBBBBB again")
;

done_testing();

