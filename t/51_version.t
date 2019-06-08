#!/usr/bin/env perl
# Copyright 2017-2019 Frank Breedijk
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
use LWP::UserAgent;
use JSON;

use lib "lib";

my $t = Test::Mojo->new('Seccubus');

$t->get_ok('/api/version')
	->status_is(200)
	->json_is("/link",undef)
	->json_like("/status",qr/^(OK|WARN)$/)
	->json_like("/message",qr/(using the newest version|active development version|is up to date)/i)
	;

my $ua = LWP::UserAgent->new;

my $current = $ua->get("https://www.seccubus.com/version/current.json", "Accept", "application/json");
my $json = decode_json($current->decoded_content);
my $old = ${$json->{current}}[1] - 1;

$t->get_ok("/api/version/${$json->{current}}[0]/${$json->{current}}[1]")
    ->status_is(200)
    ->json_is("/link",undef)
    ->json_is("/status","OK")
    ->json_like("/message",qr/(is up to date)/i)
    ;

$t->get_ok("/api/version/${$json->{dev}}[0]/${$json->{dev}}[1]")
    ->status_is(200)
    ->json_is("/link",undef)
    ->json_is("/status","OK")
    ->json_like("/message",qr/(active development version)/i)
    ;

$t->get_ok("/api/version/${$json->{cool}}[0]/${$json->{cool}}[1]")
    ->status_is(200)
    ->json_is("/link",undef)
    ->json_is("/status","OK")
    ->json_like("/message",qr/(using the newest version)/i)
    ;

$t->get_ok("/api/version/${$json->{current}}[0]/$old")
    ->status_is(200)
    ->json_like("/link",qr#^https\://github.com/seccubus/seccubus#)
    ->json_is("/status","Error")
    ->json_like("/message",qr/(Version ${$json->{current}}[0]\.${$json->{current}}[1]) is available\, please upgrade/i)
    ;





done_testing();
