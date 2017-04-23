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
package Seccubus::Controller::Sessions;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use SeccubusUsers;
use Data::Dumper;

# Create
#sub create {
#	my $self = shift;
#
#}

# Read
sub read {
    my $self = shift;

    eval {
        my $data;
        ($data->{username}, $data->{valid}, $data->{isadmin}, $data->{message}) = get_login();

        $self->render( json => $data );
    } or do {
        $self->error(join "\n", $@);
    };
}

# List
#sub list {
#   my $self = shift;
#
# }

#sub update {
#	my $self = shift;
#
#}

#sub delete {
#	my $self = shift;
#
#}

1;
