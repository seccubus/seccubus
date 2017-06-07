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
package Seccubus::Rights;

=head1 NAME $RCSfile: SeccubusRights.pm,v $

This Pod documentation generated from the module SeccubusRights gives a list of
all functions within the module.

=cut


use Exporter;
use SeccubusV2;
use Seccubus::DB;

@ISA = ('Exporter');

@EXPORT = qw (
		is_admin
		may_read
		may_write
	);

use strict;
use Carp;

sub is_admin(;$);
sub may_write($);
sub may_read($);

=head1 Access control functions

=head2 is_admin

This function checks if a user is part of the administrator group

=over 2

=item Parameters

=over 4

=item username, (optional) username to determine if this user is an admin
                by default the value of $ENV{SECCUBUS_USER} is checked

=back

=item Returns

True is the user is an admin false if the user isn't an admin

=item Checks

None

=back

=back

=cut

sub is_admin(;$) {
    my $username = shift;
    $username = $ENV{SECCUBUS_USER} unless $username;

	my $count;

	$count = sql(
        "return"    => "array",    # Group 0 is admin
		"query"     => "SELECT count(*)
		      		    FROM users, user2group
				        WHERE (
				            users.id = user2group.user_id AND
					        user2group.group_id = 1 AND
					        users.username = ?
				        );
                       ",
		"values"    => [ $username ],
	);
	return $count;
}

=head2 may_write

This function checks if the current user is allowed to write data that belongs
to a certain workspace id.

=over 2

=item Parameters

=over 4

=item workspace_id - Id of the workspace you wan tot test the rights for

User is determined by $ENV{SECCUBUS_USER}

=back

=item Returns

True if the user is allowed to write this workspace, otherwise false

=item Checks

None

=back

=cut

sub may_write($) {
	my $id = shift;

	return 1 if is_admin();

	confess "No id specified" unless $id;

	my $count = sql( "return"	=> "array",
			 "query"	=> "SELECT count(*)
			 		    FROM rights, user2group, user
					    WHERE
					    	rights.workspace_id = ? and
						rights.allow_write > 0 and
						rights.group_id = user2group.group_id and
						user2group.user_id = user.id and
						user.username = ?
					    ",
			 "values"	=> [ $id, $ENV{SECCUBUS_USER} ],
		       );
	return $count;
}

=head2 may_read

This function checks if the current user is allowed to read data that belongs
to a certain workspace id.

=over 2

=item Parameters

=over 4

=item workspace_id - Id of the workspace you wan tot test the rights for

User is determined by $ENV{SECCUBUS_USER}

=back

=item Returns

True if the user is allowed to read this workspace, otherwise false

=item Checks

None

=back

=cut

sub may_read($) {
	my $id = shift;

	return 1 if is_admin();

	confess "No id specified" unless $id;

	my $count = sql( "return"	=> "array",
			 "query"	=> "SELECT count(*)
			 		    FROM rights, user2group, users
					    WHERE
					    	rights.workspace_id = ? and
						rights.allow_read > 0 and
						rights.group_id = user2group.group_id and
						user2group.user_id = users.id and
						users.username = ?
					    ",
			 "values"	=> [ $id, $ENV{SECCUBUS_USER} ],
		       );
	return $count;
}

# Close the PM file.
return 1;
