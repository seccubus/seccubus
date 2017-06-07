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

use SeccubusV2;
use IVIL;

open(OUT, ">testdata/big.ivil.xml") or die "Unable to open output file testdata/big.ivil.xml";
print OUT xml_header();
print OUT ivil_open();
print "Creating findings\n";
print OUT "<findings>\n";

my $finding = {};
$finding->{ip} = "127.0.0.1";
$finding->{id} = "big";
$finding->{severity} = 0;
foreach my $n (0..1000) {
	$finding->{port} = $n;
	$finding->{finding} = "Big finding #$n\n";
	print OUT ivil_finding($finding);
}
print OUT "</findings>\n";

print OUT ivil_close();

close OUT;

exit();
