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

package Seccubus::Users;

use strict;
use Exporter;
use SeccubusV2;
use Seccubus::Rights;
use Seccubus::DB;
use Data::Dumper;

=head1 NAME $RCSfile: SeccubusUsers.pm,v $

This Pod documentation generated from the module Seccubus_Users gives a list of
all functions within the module

=cut

our @ISA = ('Exporter');

our @EXPORT = qw (
    get_user_id
    get_users
    add_user
    get_login
    set_password
    check_password
);

use Carp;
use Crypt::PBKDF2;


my $pbkdf2 = Crypt::PBKDF2->new(
    hash_class => 'HMACSHA2',
    hash_args => {
        sha_size => 512,
    },
    iterations => 50000,
    salt_len => 10,
);

=head1 User manipulation

=head2 get_user_id

This function looks up the numeric user_id based on the username

=over 2

=item Parameters

=over 4

p
=item user - username

=back

=item Checks

None

=back

=cut

sub get_user_id {
    my $user = shift;
    confess "No username specified" unless $user;

    my $id = sql (
        "return"    => "array",
        "query"     => "select id from users where username = ?",
        "values"    => [ $user ],
    );

    if ( $id ) {
        return $id;
    } else {
        # Could not find a userid for user
        return;
    }
}

=head2 get_users

This function return an array of users objects

=over 2

=item Parameters

=over 4

=item None

=back

=item Checks

If the user has admin rights

=back

=cut

sub get_users {
    my $user = shift;

    if ( is_admin() ) {
        my $rows = sql (
            "return" => "ref",
            "query"  => "
                SELECT      u.id, u.username, u.name, g.id, g.name
                FROM        users u
                LEFT JOIN   user2group u2g
                ON          u2g.user_id = u.id
                LEFT JOIN   groups g
                ON          u2g.group_id = g.id
                GROUP BY    u.id,u.username, u.name, g.id, g.name
                ORDER BY    u.username, g.name;
            ",
        );
        my $users = [];
        my $user = {
            username => ""
        };
        foreach my $row ( @$rows ) {
            if ( $user->{username} ne $$row[1] ) {
                push @$users, $user unless $user->{username} eq "";
                $user = {
                    id          => $$row[0],
                    username    => $$row[1],
                    name        => $$row[2],
                };
            }
            if ( $$row[2] ) {
                $user->{groups} = [] unless $user->{groups};
                push @{$user->{groups}}, { id => $$row[3], name => $$row[4] };
            }
        }
        push @$users, $user;

        return $users;
    } else {
        confess("Permission denied");
    }
}

=head2 add_user

This function adds a use to the users table and makes him member of the all
group.

=over 2

=item Parameters

=over 4

=item user - username

=item name - "real" name of the user

=item isadmin - indicates that the user is an admin (optional)

=back

=item Checks

In order to run this function you must be an admin

=back

=cut

sub add_user {
    my $user = shift;
    my $name = shift;
    my $isadmin = shift;

    my ( $id );

    confess "No userid specified" unless $user;
    confess "No name specified for user $user" unless $name;

    if ( is_admin() ) {
        my ( $id ) = sql(
            return      => "array",
            query       => "SELECT id FROM users WHERE `username` = ?",
            values      => [ $user ]
        );
        confess "Username '$user' already exists" if $id;
        $id = sql(
            "return"    => "id",
            "query"     => "INSERT into users (`username`, `name`) values (? , ?)",
            "values"    => [$user, $name],
        );
        #Make sure member of the all group
        sql(
            "return"    => "id",
            "query"     => "INSERT into user2group values (?, ?)",
            "values"    => [$id, 2],
        );
        if ( $isadmin ) {
            # Make user meber of the admins group
            sql(
                "return"    => "id",
                "query"     => "INSERT into user2group values (?, ?)",
                "values"    => [$id, 1],
            );
        }
        # Set random password
        my $password = "";
        $password .= ("A".."Z","a".."z",0..9)[rand 62] for 1..16;
        set_password($user,$password);
    } else {
        confess "Permission denied while adding user";
    }
}

=head2 get_login

This function logs in a user

=over 2

=item Parameters

=over 4

=item Username (optional) - If a username is provided, check if it is valid

=back

=item Returns

=over 4

=item Username

=item Valid (0 or 1)

=item Admin (0 or 1)

=item Message

=back

=back

=cut

sub get_login {
    my $username = shift;

    $username = $ENV{SECCUBUS_USER} unless $username;

    my $name = sql(
        "return"    => "array",
        "query"     => "select name from users where username = ?",
        "values"    => [ $username ],
    );
    if ( $name ) {
        # Valid user
        return($username,1,is_admin($username),"Valid user '$name' ($username)");
    } else {
        # Invalid user
        return(undef,0,0,"Undefined user '$username'");
    }
}

=head2 set_password

This function sets the password of a user

=over 2

=item Parameters

=over 4

=item Username

=item Password

=item Checks

Checks if the user setting the password is an admin or the user itself.

=item Returns

=over 4

=item true if the password was reset, false if not

=back

=back

=cut

sub set_password {
    my $user = shift or confess("You must provide a username to set_password");
    my $password = shift or confess("You must provide a valid password to set_password");

    my ( $cuser, $isadmin ) = get_login();

    if ( $user eq $cuser || $isadmin ) {
        my $hash = $pbkdf2->generate($password);

        my $sth = sql (
            return  => "handle",
            query   => "UPDATE users set `password` = ? where `username` = ?",
            values  => [ $hash, $user ],
        );
        return $sth->rows;
    } else {
        return;
    }

}

=head2 check_password

This function checks if the password of a user, or the hash value of it is valid

=over 2

=item Parameters

=over 4

=item Username

=item Password - If password is not provided the hash will be checked

=item Hash     - If hash is not provied the password will be checked

=item Checks

Checks if the user and the password in the database match. If a hash is provided this function checks
if the hash matches the hash of the encrypted password (this is stored in the session cookie of the gui)

=item Returns

=over 4

=item true if there is a match, false if there is no match

=back

=back

=cut

sub check_password {
    my $user = shift or confess("Must provide a username to check_password");
    my $password = shift;
    my $hash = shift;

    if ( $password ) {
        my ( $dbhash ) = sql (
            return  => "array",
            query   => "select password from `users` where username = ?",
            values  => [ $user ],
        );
        if ( $dbhash ) {
            return $pbkdf2->validate($dbhash, $password);
        } else {
            return;
        }
    } elsif ( $hash ) {
        my ( $count ) = sql(
            return  => "array",
            query   => "select count(*) from `users` where username = ? and sha2(password,256) = ?",
            values  => [ $user, $hash ]
        );
    } else {
        confess("check_password needs either a password or a hash value");
    }
}

# Close the PM file.
return 1;
