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
use Seccubus::Users;
use Seccubus::DB;
use Data::Dumper;
use JSON;

# Create
sub create {
	my $self = shift;

    my $config = get_config;

    my $header_name = $config->{auth}->{http_auth_header};
    my $header_value = "";
    $header_value = $self->req->headers->header($header_name) if $header_name;
    my $user = $self->req->json();

    if ( ( $self->app->mode() eq "production" && $header_name ) || ( $self->app->mode() eq "development" && $header_value ) ) {
        # Ignore password and log in with the username in the header
        #my ( $dbuser ) = get_login($user->{username});
        my ( $dbuser, $valid, $isadmin, $message ) = get_login($header_value);
        $user->{username} = $dbuser;
        if ( ! $valid ) {
            $self->session(expires => 1); # Expire session
            delete $self->session->{user};
            $self->error("Login failed: $message", 401);
            return;
        }
    } else {
        # Log in with username and password
        if ( $user && $user->{username} && $user->{password} ) {
            unless ( check_password($user->{username}, $user->{password},undef) ) {
                $self->session(expires => 1); # Expire session
                delete $self->session->{user};
                $self->error("Login failed", 401);
                return;
            }
        } else {
            $self->session(expires => 1); # Expire session
            delete $self->session->{user};
            $self->error("Invalid user object");
            return;
        }
    }
    $self->session->{user}->{name} = $user->{username};
    my ( $hash ) = sql (
        return  => "array",
        query   => "select sha2(password,256) from `users` where username = ?",
        values  => [ $user->{username} ]
    );
    $self->session->{user}->{hash} = $hash;
    my ( $username, $valid, $isadmin, $message ) = get_login($user->{username});
    if ( $isadmin ) {
        $isadmin = JSON::true;
    } else {
        $isadmin = JSON::false;
    }

    $self->render( json => {
        status  => "Success",
        message => "You are now logged in as $user->{username}",
        password => "",
        isAdmin => $isadmin,
    });
}

# Read
sub read {
    my $self = shift;

    my $config = get_config();
    my $header_name = $config->{auth}->{http_auth_header};
    my $header_value = "";
    $header_value = $self->req->headers->header($header_name) if $header_name;

    my $u = $self->session->{user};


    if ( ( $header_name && $self->app->mode() eq "production" ) || ( $self->app->mode() eq "development" && $header_value ) ) {
        $ENV{SECCUBUS_USER} = $header_value;
    } elsif ( $u && check_password($u->{name},undef,$u->{hash}) ) {
        $ENV{SECCUBUS_USER} = $u->{name};
    } else {
        $ENV{SECCUBUS_USER} = "Not logged in";
    }

    eval {
        my $data;

        ($data->{username}, $data->{valid}, $data->{isAdmin}, $data->{message}) = get_login();

        if ( $data->{isAdmin} ) {
            $data->{isAdmin} = JSON::true;
        } else {
            $data->{isAdmin} = JSON::false;
        }
        $data->{username} = "" unless $data->{username};

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

sub delete {
	my $self = shift;

    delete $self->session->{user};

    $self->error("You are logged out", 200);
}

1;
