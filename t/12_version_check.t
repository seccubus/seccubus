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
use Test::More tests => 3;
use Data::Dumper;
use JSON;

my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/UpToDate.pl ";
$cmd .= join " ", @_;
ok($cmd, "Running command $cmd");
my @result = split /\r?\n/, `$cmd`;
while ( shift @result ) {};
my $json = decode_json(join "\n", @result);

isnt($$json[0]->{status},'Error',"Status does not return an error");
isnt($$json[0]->{message},'',"Status has a message: $$json[0]->{message}");

done_testing();