# ------------------------------------------------------------------------------
# Copyright 2014 Frank Breedijk
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
package SeccubusNotifications;

=head1 NAME $RCSfile: SeccubusNotifications.pm,v $

This Pod documentation generated from the module SeccubusNotifications gives a 
list of all functions within the module.

=cut

use SeccubusDB;
use SeccubusRights;
use SeccubusRuns;
use Net::SMTP;
use MIME::Base64;

@ISA = ('Exporter');

@EXPORT = qw ( 
		get_notifications
		create_notification
		update_notification
		do_notifications
		del_notification
	);

use strict;
use Carp;

sub get_notifications($;);
sub create_notification($$$$$$;);
sub update_notification($$$$$;);
sub do_notifications($$$;);
sub del_notification($;);

=head1 Data manipulation - notifications

=head2 get_notifications

Get all notification for a certain scan from the database

=over 2

=item Parameters

=over 4

=item scan_id - id of the scan

=back 

=item Checks

User must be able to read workspace. 

=back

=cut

sub get_notifications($;) {
	my $scan_id = shift or die "No scan_id provided";

	my ($workspace_id) = 
		sql( 	return	=> "array",
			query	=> "
				SELECT	workspace_id
				FROM	scans
				WHERE	scans.id = ?",
			values	=> [ $scan_id ]
	);
	if ( $workspace_id && may_read($workspace_id)) {
		return sql( "return"	=> "ref",
			    "query"	=> "
			    	SELECT	notifications.id, subject, recipients, 
					message, event_id, events.name
				FROM	notifications, events, scans
				WHERE	scans.workspace_id = ? AND
					scans.id = ? AND
					notifications.scan_id = scans.id AND
					notifications.event_id = events.id
				ORDER BY subject",
			    "values"	=> [ $workspace_id, $scan_id ]
		);
	} else {
		return undef;
	}
}

=head2 create_notification

Creates a notification

=over 2

=item Parameters

=over 4

=item workspace_id - Id of workspace in which notification needs to be created

=item scan_id - Id of the scan this notification belongs to

=item event_id - Id of the event on which a scan has to be created

=item subject

=item recipents

=item message

=back 

=item Checks

User must be able to write workspace. 

Scan must exist in workspace

Event must exist

=item Returns

Newly inserted id and event_name

=back

=cut

sub create_notification($$$$$$;) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_id = shift or die "No scan_id provided";
	my $event_id = shift or die "No event_id provided";
	my $subject = shift or die "Subject is empty";
	my $recipients = shift or die "Recipients empty";
	my $message = shift or die "Message empty";

	if( may_write($workspace_id) ) {
		my ($id) = sql( return	=> "array",
				query	=> "
					SELECT	scans.id
					FROM	scans
					WHERE	scans.id = ? AND 
					workspace_id = ?",
				values	=> [ $scan_id, $workspace_id ]
		);
		if ( $id != $scan_id ) {
			die ("Scan $scan_id is not in workspace $workspace_id");
		}
		my $event_name;
		($id, $event_name) = sql(
			return 	=> "array",
			query	=> "
				SELECT 	id, name
				FROM	events
				WHERE	id = ?",
			values	=> [ $event_id ]
		);
		if ( $id != $event_id ) {
			die ("Event_id $event_id not found");
		};
		$id = sql(	return	=> "id",
				query	=> "
					INSERT INTO notifications (scan_id, 
						event_id, subject, recipients, 
						message)
					VALUES	(?,?,?,?,?)",
				values	=> [ $scan_id, $event_id, $subject, 
					$recipients, $message ]
		);
		return( ($id,$event_name) );



					
	} else {
		return undef;
	}
}

=head2 update_notification

Updates a notification

=over 2

=item Parameters

=over 4

=item notification_id - Id of the notification

=item scan_id - Id of the scan this notification belongs to

=item event_id - Id of the event on which a scan has to be created

=item subject

=item recipents

=item message

=back 

=item Checks

User must be able to write workspace. 

Scan must exist in workspace

Event must exist

=item Returns

Description of the event

=back

=cut
sub update_notification($$$$$;) {
	my $notification_id = shift or die "No workspace_id provided";
	my $event_id = shift or die "No event_id provided";
	my $subject = shift or die "Subject is empty";
	my $recipients = shift or die "Recipients empty";
	my $message = shift or die "Message empty";

	my ($workspace_id, $scan_id) = 
		sql( 	return	=> "array",
			query	=> "
				SELECT	workspace_id, scans.id
				FROM	scans, notifications
				WHERE	notifications.id = ? AND 
					scans.id = notifications.scan_id",
			values	=> [ $notification_id ]
	);
	if ( $workspace_id && may_write($workspace_id) ) {
		my ($event_name) = sql(
			return 	=> "array",
			query	=> "
				SELECT 	name
				FROM	events
				WHERE	id = ?",
			values	=> [ $event_id ]
		);
		if ( ! $event_name ) {
			die ("Event_id $event_id not found");
		};
		my $id = sql(	return	=> "id",
				query	=> "
					UPDATE notifications 
					SET	event_id = ?, subject = ?, 
						recipients = ?,	message =? 
					WHERE	id = ?",
				values	=> [ $event_id, $subject, 
					$recipients, $message, $notification_id
					]
		);
		return( ($event_name) );
	} else {
		return undef;
	}
}

=head2 del_notification

Delete a notification

=over 2

=item Parameters

=over 4

=item notification - id of the notification


=back 

=item Checks

User must be able to write workspace. 

=back

=cut

sub del_notification($;) {
	my $notification_id = shift or die "No notification_id provided";

	my ($workspace_id) = sql(
		"return"=> "array",
		"query"	=> "SELECT	workspace_id
			    FROM	notifications, scans
			    WHERE	notifications.id = ? AND
			    		notifications.scan_id = scans.id",
		"values"	=> [ $notification_id ]
	);

	if ( may_write($workspace_id)) {
		return sql( "return"	=> "handle",
			    "query"	=> "
			    	DELETE FROM notifications
				WHERE	id = ?",
			    "values"	=> [ $notification_id ]
		);
	} else {
		return undef;
	}
}

=head2 do_notifications

Send out notifications

=over 2

=item Parameters

=over 4

=item workspace_id

=item scan_id

=item event_id - What event triggers this notification

=back 

=item Checks

User must be able to read workspace. 

=item Returns

Number of notifications sent, -1 means error

=back

=cut

sub do_notifications($$$;) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_id = shift or die "No scan_id provided";
	my $event_id = shift or die "No event_id provided";

	my $config = SeccubusV2::get_config();

	if(may_read($workspace_id)) {
		# O.K. lets figure out if we have any notification configured
		my $notifications = sql (
			"return"=> "ref",
			"query"	=> "SELECT	subject, recipients, message
				    FROM	notifications, scans
				    WHERE	scan_id = scans.id AND
				    		workspace_id = ? AND
						scan_id = ? AND
						event_id = ?",
			"values"=> [ $workspace_id, $scan_id, $event_id ]
		);
		if ( 0 == @{$notifications} ) {
			return 0 # Early exit, there are no notifications;
		}

		# First get some basic information for keyword expansion
		my ( $workspace, $scan, $scanner, $param, $targets, $time) = sql(
			"return"	=> "array",
			"query"		=> "
				SELECT	workspaces.name, scans.name, 
					scannername, scannerparam, targets, 
					max(runs.time)
				FROM	workspaces, scans, runs
				WHERE	workspaces.id = scans.workspace_id AND
					runs.scan_id = scans.id AND
					workspaces.id = ? AND
					scans.id = ?",
			"values"	=> [ $workspace_id, $scan_id ]
		);

		my ( $new ) = sql(
			"return"	=> "array",
			"query"		=> "
				SELECT	count(*)
				FROM	findings
				WHERE	scan_id = ? AND
					status = 1",
			"values"	=> [ $scan_id ]
		);
		my ( $changed ) = sql(
			"return"	=> "array",
			"query"		=> "
				SELECT	count(*)
				FROM	findings
				WHERE	scan_id = ? AND
					status = 2",
			"values"	=> [ $scan_id ]
		);
		my ( $open ) = sql(
			"return"	=> "array",
			"query"		=> "
				SELECT	count(*)
				FROM	findings
				WHERE	scan_id = ? AND
					status = 3",
			"values"	=> [ $scan_id ]
		);
		my ( $noissue ) = sql(
			"return"	=> "array",
			"query"		=> "
				SELECT	count(*)
				FROM	findings
				WHERE	scan_id = ? AND
					status = 4",
			"values"	=> [ $scan_id ]
		);
		my ( $gone ) = sql(
			"return"	=> "array",
			"query"		=> "
				SELECT	count(*)
				FROM	findings
				WHERE	scan_id = ? AND
					status = 5",
			"values"	=> [ $scan_id ]
		);
		my ( $closed ) = sql(
			"return"	=> "array",
			"query"		=> "
				SELECT	count(*)
				FROM	findings
				WHERE	scan_id = ? AND
					status = 6",
			"values"	=> [ $scan_id ]
		);
		my ( $masked ) = sql(
			"return"	=> "array",
			"query"		=> "
				SELECT	count(*)
				FROM	findings
				WHERE	scan_id = ? AND
					status = 99",
			"values"	=> [ $scan_id ]
		);
		my $att = $new + $changed + $open + $gone;
		my $summary = 
qq/$att finding(s) need your attention:
NEW findings:     $new
CHANGED findings: $changed
OPEN findings:    $open
GONE findings:	  $gone

$noissue finding(s) have been marked as NO ISSUE
$closed finding(s) have been marked as CLOSED/;

		# Do keyword expansion
		foreach my $notification ( @{$notifications} ) {
			$$notification[0] =~ s/\$WORKSPACE/$workspace/g;
			$$notification[0] =~ s/\$SCANNER/$scanner/g;
			$$notification[0] =~ s/\$SCAN/$scan/g;
			$$notification[0] =~ s/\$PARAMETERS/$param/g;
			$$notification[0] =~ s/\$TIME/$time/g;
			$$notification[0] =~ s/\$ATTN/$att/g if $event_id == 2;
			$$notification[0] =~ s/\$NEW/$new/g if $event_id == 2;
			$$notification[0] =~ s/\$OPEN/$open/g if $event_id == 2;
			$$notification[0] =~ s/\$CHANGED/$changed/g if $event_id == 2;
			$$notification[0] =~ s/\$NOISSUE/$noissue/g if $event_id == 2;
			$$notification[0] =~ s/\$GONE/$gone/g if $event_id == 2;
			$$notification[0] =~ s/\$CLOSED/$closed/g if $event_id == 2;
			$$notification[0] =~ s/\$MASKED/$masked/g if $event_id == 2;
			$$notification[2] =~ s/\$WORKSPACE/$workspace/g;
			$$notification[2] =~ s/\$SCANNER/$scanner/g;
			$$notification[2] =~ s/\$SCAN/$scan/g;
			$$notification[2] =~ s/\$PARAMETERS/$param/g;
			$$notification[2] =~ s/\$TARGETS/$targets/g;
			$$notification[2] =~ s/\$TIME/$time/g;
			$$notification[2] =~ s/\$SUMMARY/$summary/g if $event_id == 2;
			$$notification[2] =~ s/\$ATTN/$att/g if $event_id == 2;
			$$notification[2] =~ s/\$NEW/$new/g if $event_id == 2;
			$$notification[2] =~ s/\$OPEN/$open/g if $event_id == 2;
			$$notification[2] =~ s/\$CHANGED/$changed/g if $event_id == 2;
			$$notification[2] =~ s/\$NOISSUE/$noissue/g if $event_id == 2;
			$$notification[2] =~ s/\$GONE/$gone/g if $event_id == 2;
			$$notification[2] =~ s/\$CLOSED/$closed/g if $event_id == 2;
			$$notification[2] =~ s/\$MASKED/$masked/g if $event_id == 2;
		}

		# Attachments
		foreach my $notification ( @{$notifications} ) {
			my @attachments = ();
			while ( $event_id == 2 && $$notification[2] =~ /\$ATTACH:(\w+)/ ) {
				my $ext = $1;
				# Lets find the attachment
				my ( $run_id ) = sql(
					"return"	=> "array",
					"query"		=> "
						SELECT	id
						FROM	runs
						WHERE	scan_id = ?
						ORDER BY time desc",
					"values"	=> [ $scan_id ]
				);
				my $atts = sql(
					"return"	=> "ref",
					"query"		=> "
						SELECT	id
						FROM	attachments
						WHERE	run_id = ? AND
							name LIKE ?",
					"values"	=> [ $run_id, "%.$ext" ]
				);
				if ( $atts ) {
					#my $att = encode_base64(get_attachment($workspace_id, $scan_id, $run_id, $att_id));
					foreach my $att_row ( @$atts ) {
						my $att_id = $$att_row[0];
						my $att = get_attachment($workspace_id, $scan_id, $run_id, $att_id);
						$att = shift @$att;
						push @attachments, "Content-Type: application/actet-stream; name=\"$$att[0]\"\nContent-Transfer-Encoding: base64\n\n" . encode_base64($$att[1]);
					}
				} else {
					push @attachments, "Content-Type: text/plain; name\"$ext.txt\"\n\nUnable to find an attachment with extenstion $ext";
				}
				$$notification[2] =~ s/\$ATTACH:\w+//;
			}
			if ( @attachments ) {
				$$notification[2] = "MIME-Version: 1.0
Content-Type: multipart/mixed; boundary=\"seccubus-message-part\"

This is a message with multiple parts in MIME format.
--seccubus-message-part
Content-Type: text/plain\n\n" . $$notification[2];
				$$notification[2] .= "--seccubus-message-part\n";
				$$notification[2] .= join "--seccubus-message-part\n", @attachments;
				$$notification[2] .= "--seccubus-message-part\n";
			} else {
				$$notification[2] = "\n$$notification[2]";
			}
		}

		# Let start sending messages
		my $smtp = Net::SMTP->new($config->{smtp}->{server});
		my $count = 0;
		foreach my $notification ( @{$notifications} ) {
			$smtp->mail($config->{smtp}->{from});
			foreach my $to ( split /\,/,  $$notification[1] ) {
				$smtp->to($to);
			}
			$smtp->data();
			$smtp->datasend("To: $$notification[1]\n");
			$smtp->datasend("From: $config->{smtp}->{from}\n");
			$smtp->datasend("Subject: $$notification[0]\n");
			#$smtp->datasend("\n");
			$smtp->datasend($$notification[2]);
			$smtp->dataend();
			$count++;
		}
		$smtp->quit;
		return $count;
	} else {
		return -1;
	}
}

# Close the PM file.
return 1;
