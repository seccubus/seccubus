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
$t->get_ok('/')
	->status_is(302)
	->header_is("location" => 'seccubus')
	->header_is("X-Clacks-Overhead" => 'GNU Terry Pratchett')
	->header_is("X-Frame-Options" => "DENY")
	->header_is("x-xss-protection" => "1; 'mode=block'")
	->header_like("Server", qr/^Seccubus v\d\.\d+$/)
	->header_unlike("Server", qr/mojo/i)
	;

$t->get_ok('/seccubus')
	->status_is(200)
	->content_like(qr/Copyright 2\d+ Frank Breedijk/i)
	->header_is("X-Clacks-Overhead" => 'GNU Terry Pratchett')
	->header_is("X-Frame-Options" => "DENY")
	->header_is("x-xss-protection" => "1; 'mode=block'")
	->header_like("Server", qr/^Seccubus v\d\.\d+$/)
	->header_unlike("Server", qr/mojo/i)
	;

done_testing();
