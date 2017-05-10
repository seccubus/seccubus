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

package SeccubusUsers;

use SeccubusRights;
use SeccubusDB;

=head1 NAME $RCSfile: SeccubusUsers.pm,v $

This Pod documentation generated from the module Seccubus_Users gives a list of 
all functions within the module

=cut

@ISA = ('Exporter');

@EXPORT = qw ( 
		get_user_id
		add_user 
		get_login
	     );

use strict;
use Carp;

sub get_user_id($);
sub add_user($$$);
sub get_login();

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

sub get_user_id($) {
	my $user = shift;
	confess "No username specified" unless $user;

	my $id = sql ( "return"	=> "array",
		       "query"	=> "select id from users where username = ?",
		       "values" => [ $user ],
		     );

	if ( $id ) {
		return $id;
	} else {
		# Could not find a userid for user
		return undef;
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

sub add_user($$$) {
	my $user = shift;
	my $name = shift;
	my $isadmin = shift;

	my ( $id );

	confess "No userid specified" unless $user;
	confess "No naem specified for user $user" unless $name;

	if ( is_admin() ) {
		my $id = sql(	"return"	=> "id",
				"query"		=> "INSERT into users (`username`, `name`) values (? , ?)",
				"values"	=> [$user, $name],
			    );
		#Make sure member of the all group
		sql("return"	=> "none",
		    "query"	=> "INSERT into user2group values (?, ?)",
		    "values"	=> [$id, 2],
	 	   );
		if ( $isadmin ) {
			# Make user meber of the admins group
			sql("return"	=> "none",
			    "query"	=> "INSERT into user2group values (?, ?)",
			    "values"	=> [$id, 1],
			   );
		}
	}
}
=head2 get_login
 
This function returns how a user is logged in

=over 2

=item Parameters

None

=item Checks

None

=item Returns

=over 4

=item Username

=item Valid (0 or 1)

=item Admin (0 or 1)

=item Message 

=back 

=back 

=cut 

sub get_login() {
	if ( ! exists $ENV{REMOTE_ADDR} ) {
		# Running from command line means logged in as admin
		return("admin",1,1,"Running from command line as admin");
	} elsif ( ! exists $ENV{REMOTE_USER} ) {
		# No auth setup
		return("admin",1,1,"Unauthenticated user acting as admin");
	} else {
		my $name = sql ( "return"	=> "array",
		       "query"	=> "select name from users where username = ?",
		       "values" => [ $ENV{REMOTE_USER} ],
		);
		if ( $name ) {
			# Valid user
			return($ENV{REMOTE_USER},1,is_admin(),"Valid user '$name' ($ENV{REMOTE_USER})");
		} else {
			# Invalid user
			return("<undef>",0,0,"Undefined user '$ENV{REMOTE_USER}'");
		}
	}
}


# Close the PM file.
return 1;
