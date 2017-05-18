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
use Test::More tests => 1;

print `bin/nmap2ivil --scanner nmap --timestamp 200001010000 --infile testdata/nmap_script_output.xml --outfile ./tmp.ivil.xml`;
my $ivil = `cat ./tmp.ivil.xml`;
like($ivil,qr/TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA/,"Nmap script output is in ivil output");
unlink "./tmp.ivil.xml";
