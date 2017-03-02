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

# Create
sub create {
	my $self = shift;

	my $notification = $self->req->json();
	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');

	if ( ! $notification ) {
			$self->error("No valid json body found"); return;		
	}

	my $error = "";
	$error = check_param("workspaceId", $workspace_id, 1);
	$error = check_param("scanId", $scan_id, 1) unless $error;
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
		 	foreach my $prop ( qw() ) {
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
	if ( ! $scan_id ) {
		$self->error("Missing parameter scan_id"); 
		return;
	}

	eval {
		my $scan = {};

	 	my $scans = get_scans($workspace_id,$scan_id);
	 	if ( @$scans ) {
		 	my $i = 0; 
		 	foreach my $prop ( qw(id name scanner parameters lastScan runs findCount targets workspace notifications password) ) {
		 		$scan->{$prop} = $$scans[0][$i];
		 		$i++
		 	}

			$self->render( json => $scan );
		} else {
			$self->error("Scan not found");
			return;
		}
	} or do {
		$self->error(join "\n", $@);
	};
}

# List
sub list {
	my $self = shift;

	my $scan_id = $self->param('scan_id');

	eval {
		my $data = [];

		my @data;
		my $notifications = get_notifications($scan_id);

		foreach my $row ( @$notifications ) {
			if ( $$row[2] ) {
				push (@data, {
					'id'		=> $$row[0],
					'subject'	=> $$row[1],
					'recipients'	=> $$row[2],
					'message'	=> $$row[3],
					'event_id'	=> $$row[4],
					'event_name'	=> $$row[5]
				})
			}
		}

		$self->render( json => $data );
	} or do {
		$self->error(join "\n", $@);
	};
}

sub update {
	my $self = shift;

	my $scan = $self->req->json();
	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');

	if ( ! $scan ) {
			$self->error("No valid json body found"); return;		
	}

	eval {
		my @data = ();
		update_scan(
			$workspace_id,
			$scan_id,
			$scan->{name},
			$scan->{scanner},
			$scan->{parameters},
			$scan->{password},
			$scan->{targets}
		);
		my $newscan;
	 	my $scans = get_scans($workspace_id,$scan_id);
	 	my $i = 0;
	 	foreach my $prop ( qw(id name scanner parameters lastScan runs findCount targets workspace notifications password) ) {
		 	$newscan->{$prop} = $$scans[0][$i];
		 	$i++
		}

		foreach my $prop ( qw(name scanner parameters password targets ) ) {
			$newscan->{$prop} = $scan->{$prop};
		}
		$self->render( json=> $newscan );
	} or do {
		$self->error(join "\n", $@);
	};
}

1;
