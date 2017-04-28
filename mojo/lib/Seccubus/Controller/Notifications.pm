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
package Seccubus::Controller::Notifications;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use SeccubusNotifications;
use Data::Dumper;

# Create
sub create {
	my $self = shift;

	my $notification = $self->req->json();
	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');

	if ( ! $notification ) {
			$self->error("No valid json body found"); return;
	}

	#die Dumper $notification;

	my $error = "";
	$error = check_param("workspace", $workspace_id, 1);
	$error = check_param("scan", $scan_id, 1) unless $error;
	$error = check_param("trigger", $notification->{trigger}, 1) unless $error;
	$error = check_param("subject", $notification->{subject}, 0) unless $error;
	$error = check_param("recipients", $notification->{recipients}, 0) unless $error;
	$error = check_param("message", $notification->{message}, 0) unless $error;
	if ( $error ) {
		$self->error($error);
		return;
	}

	eval {
		my @data = ();
		my ($newid, $event_name) = create_notification(
			$workspace_id,
			$scan_id,
			$notification->{trigger},
			$notification->{subject},
			$notification->{recipients},
			$notification->{message},
		);

		if ( ! $newid ) {
			$self->error("create_notification did not return a new id");
		} else {
			my $new = {};
		 	my $notifications = get_notifications($scan_id,$newid);
		 	my $i = 0;
		 	foreach my $prop ( qw(id subject recipients message trigger triggerName) ) {
		 		$new->{$prop} = $$notifications[0][$i];
		 		$i++
		 	}

			$self->render( json=> $new );
		}
	} or do {
		$self->error(join "\n", $@);
	};
}

# Read
sub read {
	my $self = shift;

	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');
	my $id = $self->param('id');

	eval {
		my $notifications = get_notifications($scan_id, $id);

	 	if ( @$notifications ) {
	 		# Check workspace id here
	 		if ( $$notifications[0][6] == $workspace_id ) {
				my $notification = {};

		 		my $i = 0;
			 	foreach my $prop ( qw(id subject recipients message trigger triggerName) ) {
			 		$notification->{$prop} = $$notifications[0][$i];
			 		$i++;
			 	}
				$self->render( json => $notification );
			} else {
				$self->error("Notification not found");
			}
		} else {
			$self->error("notification not found");
			return;
		}
	} or do {
		$self->error(join "\n", $@);
	};
}

# List
sub list {
	my $self = shift;

	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');

	eval {
		my $data = [];

		my $notifications = get_notifications($scan_id);

		foreach my $row ( @$notifications ) {
		 	my $i = 0;
		 	# Check workspace id
		 	if ( $$row[6] == $workspace_id ) {
			 	my $not = {};
			 	foreach my $prop ( qw(id subject recipients message trigger triggerName) ) {
			 		$not->{$prop} = $$row[$i];
			 		$i++
			 	}
			 	push @$data, $not;
			}
		}

		$self->render( json => $data );
	} or do {
		$self->error(join "\n", $@);
	};
}

sub update {
	my $self = shift;

	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');
	my $id = $self->param('id');

	my $notification = $self->req->json();
	if ( ! $notification ) {
			$self->error("No valid json body found");
			return;
	}
	if ( $notification->{id} != $id ) {
		$self->error("Id in url ($id) is not equal to id in object ($notification->{id}");
	}

	my $oldnot = get_notifications($scan_id,$id);
	if ( $$oldnot[0][6] != $workspace_id ) {
		$self->error("Notification $id not found in scan $scan_id in workspace $workspace_id");
		return;
	}

	eval {
		my @data = ();
		update_notification(
			$notification->{id },
			$notification->{trigger},
			$notification->{subject},
			$notification->{recipients},
			$notification->{message},
		);
		my $newnot;
	 	my $nots = get_notifications($scan_id,$id);
	 	my $i = 0;
	 	foreach my $prop ( qw(id subject recipients message trigger triggerName) ) {
		 	$newnot->{$prop} = $$nots[0][$i];
		 	$i++;
		}

		$self->render( json=> $newnot );
	} or do {
		$self->error(join "\n", $@);
	};
}

sub delete {
	my $self = shift;

	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');
	my $id = $self->param('id');

	my $oldnot = get_notifications($scan_id,$id);
	if ( $$oldnot[0][6] != $workspace_id ) {
		$self->error("Notification $id not found in scan $scan_id in workspace $workspace_id");
		return;
	}

	eval {
		my $sth = del_notification($id);
		if ( $sth ) {
			$self->render( json =>
				{
					status => "OK",
					message => "Notification deleted"
				},
				status => 200
			);
		} else {
			$self->error("Delete failed");
		}
	} or do {
		$self->error(join "\n", $@);
	};

}

1;
