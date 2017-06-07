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

use Test::More;
use Test::Mojo;
use SeccubusV2;

use lib "lib";

my $t = Test::Mojo->new('Seccubus');

# Log in
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200,"Login ok")
;


my $config = get_config();

# Get the scanners
$t->get_ok('/api/scanners')
	;

# Compare with what is in the directories
my $i = 0;
my @scanners = sort glob $config->{paths}->{scanners} . "/*";

foreach my $scanner ( @scanners ) {
	my $help = `cat $scanner/help.html`;
	my $description = `cat $scanner/description.txt`;
	my $defaults = `cat $scanner/defaults.txt`;
	$scanner =~ /([^\/]*$)/;
	my $scannername = $1;
	$t->json_has("/$i")
	->json_is("/$i/help", $help)
	->json_is("/$i/description", $description)
	->json_is("/$i/params", $defaults)
	->json_is("/$i/name", $scannername)
	;
	$i++;
}
# That should be all folks
$t->json_hasnt("/$i");

done_testing();
