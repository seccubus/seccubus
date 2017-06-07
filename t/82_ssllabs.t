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
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200,"Login ok")
;

# Create
$t->post_ok('/api/workspaces', json => { 'name' => 'test1'})
    ->status_is(200)
;

# Create a scan
$t->post_ok('/api/workspace/100/scans',
    json => {
        name          => 'ssl',
        scanner       => 'SSLlabs',
        parameters    => '--hosts @HOSTS --from-cache',
        targets       => "www.seccubus.com\nwww.schubergphilis.com\nbadssl.com\nexpired.badssl.com\nmozilla-old.badssl.com\nssl.sectionzero.org"
    })
    ->status_is(200)
;

# Create gradeonly scan
$t->post_ok('/api/workspace/100/scans',
    json => {
        name          => "gradeonly",
        scanner       => "SSLlabs",
        parameters    => '--hosts @HOSTS --from-cache --publish --gradeonly',
        targets       => "www.seccubus.com\nwww.schubergphilis.com",
    })
    ->status_is(200)
;

# Create gradeonly scan that will fail
$t->post_ok('/api/workspace/100/scans',
    json => {
        "name"          => "gradeonly_error",
        "scanner"       => "SSLlabs",
        "parameters"    => '--hosts @HOSTS --from-cache --gradeonly',
        "targets"       => "www1.example.com\nnope.seccubus.com"
    })
    ->status_is(200)
;

# Lets run scans
pass("Running ssllabs scan");
`bin/do-scan -w test1 -s ssl`;
is($?,0,"Command executed ok");

pass("Running gradeonly scan");
`bin/do-scan -w test1 -s gradeonly`;
is($?,0,"Command executed ok");

pass("Running gradeonly_error scan");
`bin/do-scan -w test1 -s gradeonly_error`;
is($?,0,"Command executed ok");

# Reactivate Mojo
$t = Test::Mojo->new('Seccubus');

# Log in
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200,"Login ok")
;

# We should have a lot of findings in scan 1
$t->get_ok('/api/workspace/100/findings?Limit=-1&scanIds[]=1')
    ->status_is(200)
    ->json_has("/50", "Should have at least 50 findings in normal scan")
;
foreach my $f ( @{$t->{tx}->res()->json()} ) {
    unlike($f->{find}, qr/^Unknown finding/i, "Finding $f->{id} is not an unknown finding");
}

# We should only have grade or gradeTrustIgnored plugins
$t->get_ok('/api/workspace/100/findings?scanIds[]=2')
    ->status_is(200)
;
foreach my $f ( @{$t->{tx}->res()->json()} ) {
    like($f->{plugin}, qr/^(grade(TrustIgnored)?|statusMessage|ERROR\/Assessment failed)$/i, "Finding $f->{id} is correct type");
}


# We should only have ERROR or statusMessage plugins
$t->get_ok('/api/workspace/100/findings?scanIds[]=3')
    ->status_is(200)
;
foreach my $f ( @{$t->{tx}->res()->json()} ) {
    like($f->{plugin}, qr/^(statusMessage|ERROR\/Assessment failed)$/i, "Finding $f->{id} is correct type");
}

done_testing();
