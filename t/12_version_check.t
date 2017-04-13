#!/usr/bin/env perl
# Copyright 2016 Frank Breedijk
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
use Test::More;
use Data::Dumper;
use JSON;

my $tests = 0;
my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/UpToDate.pl ";
$cmd .= join " ", @_;
ok($cmd, "Running command $cmd");
$tests++;
my @result = split /\r?\n/, `$cmd`;
while ( shift @result ) {};
my $json = [{ status => 'Error', message => 'JSON was not updated by UpToDate.pl' }];
eval {
    $json = decode_json(join "\n", @result);
    1;
} or do {
    my $e = $@;
    fail("Something went wrong: $e\n");
    $tests++;
    fail("Something went wrong: " . join "\n", @result);
    $tests++;
};

isnt($$json[0]->{status},'Error',"Status does not return an error. Message: $$json[0]->{message}");
$tests++;
isnt($$json[0]->{message},'',"Status has a message: $$json[0]->{message}");
$tests++;

done_testing($tests);