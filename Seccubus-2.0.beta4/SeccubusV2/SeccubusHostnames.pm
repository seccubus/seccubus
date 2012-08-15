# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Seccubus perl module. This is where most of the real logic is
# ------------------------------------------------------------------------------
package SeccubusHostnames;

=head1 NAME $RCSfile: SeccubusHostnames.pm,v $

This Pod documentation generated from the module SeccubusHostnames gives a list
of all functions within the module.

=cut

use SeccubusDB;
use SeccubusRights;

@ISA = ('Exporter');

@EXPORT = qw ( 
		update_hostname
	);

use strict;
use Carp;

sub update_hostname($$$;);

=head1 Data manipulation - hostnames

=head2 update_hostname

This function updates (or creates a new) ip - hostname combination

=over 2

=item Parameters

=over 4

=item workspace_id - workspace in which to add the hostname

=item ip - ip address

=item name - hostname

=back

=item Checks

Must have write rights in the workspace_id.

=back

=cut

sub update_hostname($$$;) {
	my $workspace_id = shift;
	my $ip = shift;
	my $name = shift;

	confess "Invalid parameters" unless ( $workspace_id && $ip && $name );

	if ( may_write($workspace_id) ) {
		my $count = sql( "return"	=> "array",
				 "query"	=> "SELECT COUNT(*)
				 		    FROM host_names
						    WHERE workspace_id = ? AND ip = ?",
				 "values"	=> [ $workspace_id, $ip ]
			       );
		if ( $count == 0 ) {
			sql( "return"	=> "id",
			     "query"	=> "INSERT INTO host_names (workspace_id, ip, name) values (?, ?, ?);",
			     "values"	=> [ $workspace_id, $ip, $name ],
			   );
		} else {
			sql( "return"	=> "id",
			     "query"	=> "UPDATE host_names 
			     		    SET name = ? 
					    WHERE workspace_id = ? AND ip = ?",
			     "values"	=> [ $name, $workspace_id, $ip ],
			   );
		}
	} else {
		confess "You have no rights to write workspace $workspace_id";
	}
}

# Close the PM file.
return 1;
