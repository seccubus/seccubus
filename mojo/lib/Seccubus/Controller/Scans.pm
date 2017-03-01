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
use SeccubusWorkspaces;
use SeccubusScans;

# Create
sub create {
	my $self = shift;

	my $workspace = $self->req->json();

	if ( ! $workspace ) {
			$self->error("No json body found"); return;		
	}
	if ( ! $workspace->{name} ) {
			$self->error("No name provided"); return;				
	}
	my $id = get_workspace_id($workspace->{name});
	if ( $id ) {
		$self->error("Workspace with name $workspace->{name} already exists"); return
	}
	$id = create_workspace($workspace->{name});

	$self->render(
		json=> {
			name => $workspace->{name},
			id => $id
		}
	);
}

#Read
#sub read {
#	my $self = shift;
#
#	my $data = [ $self->param('id') ];
#
#	$self->render(
#		json => $data,
#	);
#}

# List
sub list {
	my $self = shift;
	
	my $data = [];
	my $workspaces = get_workspaces;
	foreach my $row ( @$workspaces ) {
		push @$data, {
			'id'		=> $$row[0],
			'name'		=> $$row[1],
			'lastScan'	=> $$row[2],
			'findCount'	=> $$row[3],
			'scanCount'	=> $$row[4],
		};
	}

	$self->render( json => $data );
}

sub update {
	my $self = shift;

	my $id = $self->param('id');

	if ( ! $id ) {
		$self->error("Workspace id is missing"); return;
	}

	my $workspace = $self->req->json();

	if ( ! $workspace ) {
			$self->error("No json body found"); return;		
	}
	if ( ! $workspace->{name} ) {
			$self->error("No name provided"); return;				
	}
	my $dubid = get_workspace_id($workspace->{name});

	if ( $dubid && $id != $dubid ) {
		$self->error("A workspace with name $workspace->{name} already exists");
		return;
	}

	eval {
		my $count = edit_workspace($id, $workspace->{name});
		if ( $count ) {
			$self->render(json => { id => $id, name => $workspace->{name} });
		} else {
			$self->error("Workspace with id $id does not exist");
		}
	} or do {
		$self->error(join "\n", $@);
	}
}

1;
