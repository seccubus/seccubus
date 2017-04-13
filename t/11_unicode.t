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
use Data::Dumper;
use Test::More tests => 1;
use XML::Simple;
my $tests = 0;


if (`hostname` =~ /^sbpd/) {
	$tests = 1;
	ok("Skipping these tests on the final build system");
} else {

	`perl -I SeccubusV2 bin/nessus2ivil --scanner Nessus --timestamp 1999123123595959 --infile testdata/unicode.nessus --outfile /tmp/unicode.ivil.xml`;
	eval {
		XMLin("/tmp/unicode.ivil.xml");
	};
	is($@,'',"Unicode in .nessus files handled correctly"); 

}

done_testing();

