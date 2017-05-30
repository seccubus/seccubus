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

use strict;
use warnings;

use lib 'lib';
use lib '..';
use lib '../SeccubusV2';
use Mojolicious::Commands;
use SeccubusV2;
use Data::Dumper;

# Start command line interface for application

my $config = get_config();

my $listen = "http://*:" . $config->{http}->{port};
if ( $config->{http}->{cert} && $config->{http}->{key} && -e $config->{http}->{cert} && -e $config->{http}->{key}) {
    $listen = "https://*:" . $config->{http}->{port} . "?cert=" . $config->{http}->{cert} . "&key=" . $config->{http}->{key};
}

Mojolicious::Commands->start_app('Seccubus');
