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
use Mojo::Base -strict;

use strict;

use lib "lib";

use Test::More;
use Test::Mojo;
use Data::Dumper;

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
is($?,0,"Import ran ok");
pass("Importing ssllabs-schubergphilis scan");
`bin/load_ivil -w findings -s schubergphilis -t 20170101000100 --scanner SSLlabs testdata/ssllabs-schubergphilis.ivil.xml`;
is($?,0,"Import ran ok");
pass("Importing ssllabs-seccubus scan, again");
`bin/load_ivil -w findings -s seccubus -t 20170101000200 --scanner SSLlabs testdata/ssllabs-seccubus.ivil.xml`;
is($?,0,"Import ran ok");
pass("Importing nmap scan");
`bin/load_ivil -w findings -s nmap -t 20170101000300 --scanner NMap testdata/nmap.ivil.xml`;
is($?,0,"Import ran ok");

# Should fail with non numeric workspace
$t->get_ok('/workspace/a/findings')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

$t->get_ok('/workspace/100/findings')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},200,"200 Elements returned");

$t->get_ok('/workspace/100/findings?Limit=-1')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},324,"324 Elements returned");

# Should get no findings is scanId doesn't exist
$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=54345')
    ->status_is(200)
    ->json_is([])
    ;

$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=1')
    ->status_is(200)
    ;
my $scan1 = $t->{tx}->res()->json();
is(@$scan1,97,"97 Elements returned");

$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=2')
    ->status_is(200)
    ;
my $scan2 = $t->{tx}->res()->json();
is(@$scan2,185,"185 Elements returned");

$t->get_ok('/workspace/100/findings?Limit=-1&scanIds[]=3')
    ->status_is(200)
    ;
my $scan3 = $t->{tx}->res()->json();
is(@$scan3,42,"42 Elements returned");

# Testing host filter
my $count = {};
foreach my $f ( @$scan3 ) {
    $count->{Status}->{$f->{status}}++;
    $count->{Host}->{$f->{host}}++;
    $count->{HostName}->{$f->{hostname}}++ if defined $f->{hostname};
    $count->{Port}->{$f->{port}}++;
    $count->{Plugin}->{$f->{plugin}}++;
    $count->{Serverity}->{$f->{severity}}++;
    $count->{Remark}->{$f->{remark}}++ if defined $f->{remark};
}
$count->{Status}->{98} = 0;
$count->{Host}->{bla} = 0;
$count->{HostName}->{bla} = 0;
$count->{Port}->{bla} = 0;
$count->{Plugin}->{bla} = 0;
$count->{Finding}->{bla} = 0;
$count->{Severity}->{98} = 0;
$count->{Remark}->{bla} = 0;

$count->{Status}->{'*'} = 42;
$count->{Host}->{'*'} = 42;
$count->{HostName}->{'*'} = 42;
$count->{Port}->{'*'} = 42;
$count->{Plugin}->{'*'} = 42;
$count->{Severity}->{'*'} = 42;
$count->{Finding}->{'*'} = 42;
$count->{Remark}->{'*'} = 42;

$count->{Status}->{'all'} = 42;
$count->{Host}->{'all'} = 42;
$count->{HostName}->{'all'} = 42;
$count->{Port}->{'all'} = 42;
$count->{Plugin}->{'all'} = 42;
$count->{Severity}->{'all'} = 42;
$count->{Finding}->{'all'} = 42;
$count->{Remark}->{'all'} = 42;

$count->{Status}->{'null'} = 42;
$count->{Host}->{'null'} = 42;
$count->{HostName}->{'null'} = 42;
$count->{Port}->{'null'} = 42;
$count->{Plugin}->{'null'} = 42;
$count->{Severity}->{'null'} = 42;
$count->{Finding}->{'null'} = 42;
$count->{Remark}->{'null'} = 42;

foreach my $k ( qw(Status Host HostName Port Plugin Finding Severity Remark) ) {
    foreach my $h ( sort keys %{$count->{$k}} ) {
        if ( $h ne "" ) {
            $t->get_ok("/workspace/100/findings?Limit=-1&scanIds[]=3&$k=$h")
                ->status_is(200)
                ;
            my $finds = $t->{tx}->res()->json();
            is(@$finds,$count->{$k}->{$h},"$count->{$k}->{$h} findings for $k=$h");
        }
    }
}

# Update a single finding

# Non-existant finding should fail
$t->put_ok('/workspace/100/finding/12345667890' => json => { status => 1 , remark => "test" })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

$t->put_ok('/workspace/101/finding/1' => json => { status => 1 , remark => "test" })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# Cannot set to non-existant status
$t->put_ok('/workspace/100/finding/1' => json => { status => 98 , remark => "test" })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# Getting a single finding


# Test all statusses
foreach my $s ( 2..6,99,1 ) {
    pass("Setting status to $s");
    # Get first
    $t->put_ok('/workspace/100/finding/1' => json => { status => $s } )
        ->status_is(200)
        ->json_is("/status", $s)
        ->json_is("/remark", undef)
        ;
}

# Test append and overwrite comment
$t->put_ok('/workspace/100/finding/1' => json => { status => 1, remark => 'bla' } )
    ->status_is(200)
    ->json_is("/status", 1)
    ->json_is("/remark", "bla")
    ;

$t->put_ok('/workspace/100/finding/1' => json => { status => 1, remark => 'bla' } )
    ->status_is(200)
    ->json_is("/status", 1)
    ->json_is("/remark", "bla")
    ;

$t->put_ok('/workspace/100/finding/1' => json => { status => 1, remark => 'bla', append => 1 } )
    ->status_is(200)
    ->json_is("/status", 1)
    ->json_is("/remark", "bla\nbla")
    ;



done_testing();
