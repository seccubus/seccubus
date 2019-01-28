# ------------------------------------------------------------------------------
# Copyright 2018 Frank Breedijk, Jericho
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
#use Mojo::Base 'Mojolicious::Controller';

use strict;

use parent 'Mojolicious::Controller';

use lib "..";
use SeccubusV2;
use Data::Dumper;

# This action will render a template
sub new {
	my $class = shift;

	my $self = $class->SUPER::new(@_);

    # Set up cookies
    $self->session(expiration => 900);

    my $config = get_config();

	my $res = $self->res();
    my $req = $self->req();

    # CSRF protection
    if ( $req->{method} && $req->{method} ne "GET" && $req->{method} ne "DELETE" ) {
        # GET methods are considered safe...
        # DELETE requests cannot be made with CSRF techniques
        # POST/PUT requests should be application/json which cannot be generated with CSRF techniques
        # without violating same-origin policies
        if (
            ( ! $req->{content}->{headers}->header('content-type') ) ||
            $req->{content}->{headers}->header('content-type') !~ /^application\/json/
        ) {
            $self->error("CSRF protection kicked in", 500);
            return $self;
        }
    }

	# Set some default security and caching headers
	$res->headers()->header('Server' => "Seccubus v$SeccubusV2::VERSION");
	$res->headers()->header('X-Frame-Options' => 'DENY');
	$res->headers()->header('X-XSS-Protection' => "1; mode=block");
	$res->headers()->header('Cache-Control' => 'no-store, no-cache, must-revalidate');
	$res->headers()->header('X-Clacks-Overhead' => 'GNU Terry Pratchett');

	return $self;
}

# Return a JSON encoded error message

1;
