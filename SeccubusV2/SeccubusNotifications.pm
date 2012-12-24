# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Seccubus perl module. This is where most of the real logic is
# ------------------------------------------------------------------------------
package SeccubusNotifications;

=head1 NAME $RCSfile: SeccubusNotifications.pm,v $

This Pod documentation generated from the module SeccubusNotifications gives a 
list of all functions within the module.

=cut

use SeccubusDB;
use SeccubusRights;

@ISA = ('Exporter');

@EXPORT = qw ( 
		get_notifications
		create_notification
		update_notification
		do_notification
	);

use strict;
use Carp;

sub get_notifications($$;);
sub create_notification($$$$$$;);
sub update_notification($$$$$$$;);
sub do_notification($$$;);

=head1 Data manipulation - notifications

=head2 get_notifications

Get all notification for a certain scan from the database

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item scan_id - id of the scan

=back 

=item Checks

User must be able to read workspace. 

=back

=cut

sub get_notifications($$;) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_id = shift or die "No scan_id provided";

	if ( may_read($workspace_id) {
		return sql( "return"	=> "ref".
			    "query"	=> "
			    	SELECT	id, name, recipients, message, event_id,
					events.name
				FROM	notifications, events, scans
				WHERE	scans.workspace_id = ? AND
					scans.id = ? AND
					notifications.scan_id = scans.id AND
					notifications.event_id = events.id
				ORDER BY notifications.name"
			    "values"	=> [ $workspace_id, $scan_id ]
		);
	} else {
		return undef;
	}
}


# Close the PM file.
return 1;
