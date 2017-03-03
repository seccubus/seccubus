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
package Seccubus::Controller::Runs;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use SeccubusRuns;
use Data::Dumper;

# Create
#sub create {
#	my $self = shift;
#
#}

# Read
#sub read {
#	my $self = shift;
#
#}

# List
sub list {
	my $self = shift;

	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');

	eval {
		my $data = [];

		my $runs = get_runs($workspace_id, $scan_id);

		#die Dumper $runs;
		my $old_id = -1;
		foreach my $row ( @$runs ) {
			if ( $old_id ne $$row[0] ) {
				$old_id = $$row[0];
				if ( $$row[2] ) {
					push (@$data, {
						'id'		=> $$row[0],
						'time'		=> $$row[1],
						'attachments'	=> [{
							'id'		=> $$row[2],
							'name'		=> $$row[3],
							'description'	=> $$row[4]
						}]
					});
				} else {
					push (@$data, {
						'id'		=> $$row[0],
						'time'		=> $$row[1],
						attachments => []
					});
				}
			} else {
				push @{$$data[-1]->{attachments}}, {
					'id'		=> $$row[2],
					'name'		=> $$row[3],
					'description'	=> $$row[4]
				};
			}
		}

		$self->render( json => $data );
	} or do {
		$self->error(join "\n", $@);
	};
}

#sub update {
#	my $self = shift;
#
#}

#sub delete {
#	my $self = shift;
#
#}

1;
