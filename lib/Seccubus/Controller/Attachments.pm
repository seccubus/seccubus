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
package Seccubus::Controller::Attachments;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use SeccubusRuns;

# Create
#sub create {
#	my $self = shift;
#
#}

# Read
sub read {
	my $self = shift;

	my $workspace_id = $self->param("workspace_id");
	my $scan_id = $self->param("scan_id");
	my $run_id = $self->param("run_id");
	my $id = $self->param("id");

	# Return an error if the required parameters were not passed 
	my $error = "";
	if ( $workspace_id + 0 ne $workspace_id ) {
		$error = "WorkspaceId is not numeric";
	} elsif ( $scan_id + 0 ne $scan_id ) {
		$error = "scanId is not numeric";
	} elsif ( $run_id + 0 ne $run_id ) {
		$error = "runId is not numeric";
	} elsif ( $id + 0 ne $id ) {
		$error = "attachmentId is not numeric";
	};
	if ( $error ) {
		$self->error($error);
		return;
	}

	my $att = get_attachment($workspace_id, $scan_id, $run_id, $id);
	my $row = shift @$att;

	if ( $row ) {
		$self->res->headers()->header('Content-type' => 'application/x-download');
		$self->res->headers()->header('Content-Disposition' => "attachment;filename=$$row[0]");

		$self->render( data => $$row[1] );
	} else {
		return $self->reply->not_found;
	}
}

# List
#sub list {
#	my $self = shift;
#
#}


#sub update {
#	my $self = shift;
#
#}

#sub delete {
#	my $self = shift;
#
#}

1;
