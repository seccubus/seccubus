# ------------------------------------------------------------------------------
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
package Seccubus::Controller;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use parent 'Mojolicious::Controller';

use lib "..";
use SeccubusV2;
use Data::Dumper;

# This action will render a template
sub new {
	my $class = shift;

	my $self = $class->SUPER::new(@_);

	my $r = $self->res();

	# Set some default security an caching headers
	$r->headers()->header('Server' => "Seccubus v$SeccubusV2::VERSION");
	$r->headers()->header('X-Frame-Options' => 'DENY');
	$r->headers()->header('X-XSS-Protection' => "1; 'mode=block'");
	$r->headers()->header('Cache-Control' => 'no-store, no-cache, must-revalidate');
	$r->headers()->header('X-Clacks-Overhead' => 'GNU Terry Pratchett');

	return $self;
}

# Return a json encoded error message

1;
