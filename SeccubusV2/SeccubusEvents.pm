# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Seccubus perl module. This is where most of the real logic is
# ------------------------------------------------------------------------------
package SeccubusEvents;

=head1 NAME $RCSfile: SeccubusEvents.pm,v $

This Pod documentation generated from the module SeccubusEvents gives a 
list of all functions within the module.

=cut

use Exporter;

@ISA = ('Exporter');

@EXPORT = qw ( 
		get_events
	);

use strict;
use Carp;

use SeccubusDB;

sub get_events(;);

=head1 Data manipulation - Events

=head2 get_events

Returns a reference to a list of events (id, name)

=over 2

=item Parameters

=over 4

None

=back 

=item Checks

Only events the user can read and/or write are returned

=back 

=cut 

sub get_events(;) {
	my $events; 
	
	$events = 
		sql( "return"	=> "ref",
		     "query"	=> "
				   SELECT id, name
				   FROM events 
				   ORDER BY id
				   ",
	       );
	return $events;
}

# Close the PM file.
return 1;
