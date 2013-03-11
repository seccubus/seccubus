# ------------------------------------------------------------------------------
# Copyright 2013 Frank Breedijk
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
