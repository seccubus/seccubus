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

use lib "lib";

my $t = Test::Mojo->new('Seccubus');
$t->get_ok('/version')
	->status_is(200)
	->json_is("/link","")
	->json_like("/status",qr/^(OK|WARN)$/)
	->json_like("/message",qr/(active development version|is up to date)/i)
	;

done_testing();
