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

my $t = Test::Mojo->new('Seccubus');

my $config = get_config();

# Get the scanners
$t->get_ok('/scanners') 
	;

# Compare with what is in the directories
my $i = 0;
my @scanners = split "\n", `ls $config->{paths}->{scanners}|sort`; # Some ls' sort differently then others
foreach my $scanner ( @scanners ) {
	my $help = `cat $config->{paths}->{scanners}/$scanner/help.html`;
	my $description = `cat $config->{paths}->{scanners}/$scanner/description.txt`;
	my $defaults = `cat $config->{paths}->{scanners}/$scanner/defaults.txt`;
	$t->json_has("/$i")
	->json_is("/$i/name", $scanner)
	->json_is("/$i/help", $help)
	->json_is("/$i/description", $description)
	->json_is("/$i/params", $defaults)
	;
	$i++;
}
# That should be all folks
$t->json_hasnt("/$i");

done_testing();
