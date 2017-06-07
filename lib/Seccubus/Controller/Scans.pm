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
package Seccubus::Controller::Scans;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use Seccubus::Workspaces;
use Seccubus::Scans;

# Create
sub create {
	my $self = shift;

	my $scan = $self->req->json();
	my $workspace_id = $self->param('workspace_id');

	if ( ! $scan ) {
		$self->error("No valid json body found");
        return;
	}

	eval {
		my @data = ();
		my $newid = create_scan(
			$workspace_id,
			$scan->{name},
			$scan->{scanner},
			$scan->{parameters},
			$scan->{password},
			$scan->{targets}
		);
		if ( ! $newid ) {
			$self->error("create_scan did not return a new scan_id");
		} else {
			my $newscan;
		 	my $scans = get_scans($workspace_id,$newid);
		 	my $i = 0;
		 	foreach my $prop ( qw(id name scanner parameters lastScan runs findCount targets workspace notifications password) ) {
		 		$newscan->{$prop} = $$scans[0][$i];
		 		$i++
		 	}

			$self->render( json=> $newscan );
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

	my $workspace_id = $self->param('workspace_id');
	if ( ! $workspace_id ) {
		$self->error("Parameter workspace_id is missing");
		return;
	}

	eval {
		my $data = [];

	 	my $scans = get_scans($workspace_id);
		foreach my $row ( @$scans ) {
			push (@$data, {
				'id'		=> $$row[0],
				'name'		=> $$row[1],
				'scanner'	=> $$row[2],
				'parameters'	=> $$row[3],
				'lastScan'	=> $$row[4],
				'runs'		=> $$row[5],
				'findCount'	=> $$row[6],
				'targets'	=> $$row[7],
				'workspace'	=> $$row[8],
				'notifications'	=> $$row[9],
				'password'	=> $$row[10],
			});
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
