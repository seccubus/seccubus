# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Seccubus perl module. This is where most of the real logic is
# ------------------------------------------------------------------------------
#  Copyright 2011 Frank Breedijk of Schuberg Philis
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
# ------------------------------------------------------------------------------
package SeccubusRuns;

=head1 NAME $RCSfile: SeccubusRuns.pm,v $

This Pod documentation generated from the module SeccubusRuns gives a list of
all functions within the module.

=cut

use SeccubusDB;
use SeccubusRights;

@ISA = ('Exporter');

@EXPORT = qw ( 
		update_run
	);

use strict;
use Carp;

sub update_run($$$;$$);

=head2 update_run

This function updates the run table for the given parameters. If the run does
not exist it wil be created

=over 2

=item Parameters

=over 4

=item workspace_id  - Manditory

=item scan_id     - Manditory

=item timestamp   - Mandatory

=item attachment   - Optional, path of the file to attache

=item description   - Optional, Description of the file

=back

=item Returns

run_id

=item Checks

Must be a reader to get the run_id, must be a writer to create or alter a run 
Attachment must be a file that exists

=back

=cut

sub update_run($$$;$$) {
	my $workspace_id = shift or confess "No workspace_id provided to update_run";
	my $scan_id = shift or confess "No scan_id provided to update_run";
	my $timestamp = shift or confess "No timestamp provided to update_run";
	my $attachment = shift;
	my $description = shift;

	if ( ! $timestamp =~ /^\d\d\d\d\-\d\d\-\d\d \d\d\:\d\d\:\d\d$/ ) {
		confess "Timestamp '$timestamp' does not have the correct format";
	}

	my $run_id = 0;

	if ( may_read($workspace_id) ) {
		# Lets try to find the run_id first
		$run_id = sql ( "return"	=> "array",
			      	"query"		=> "SELECT runs.id FROM runs, scans WHERE scans.id = runs.scan_id and scans.workspace_id = ? and scans.id = ? and runs.time = ?;",
				"values"	=> [ $workspace_id, $scan_id, $timestamp ],
			      );
		if ( ( ! $run_id ) and may_write($workspace_id) ) {
			$run_id = sql ( "return"	=> "id",
					"query"		=> "INSERT into runs (scan_id, time) values (?, ? );",
					"values"	=> [ $scan_id, $timestamp ],
				      );
		} 
		if ( $run_id && -e $attachment ) {
			open ATT, $attachment or confess "Unable to open attachment '$attachment'";
			my @file = <ATT>; # Slurp
			close ATT;
			my $name = basename($attachment);
			my $id = sql( "return"	=> "id",
				      "query"	=> "INSERT into attachments(run_id, name, description, data) values (?, ?, ?);",
				      "values"	=> [ $run_id, $name, $description, join "", @file ]
				    );
			@file = undef;
		} else {
			confess("Run not found or attachment doesn't exist");
		}
	} else {
		warn "You are not authorised to read workspace $workspace_id";
	}
	return $run_id;
}

# Close the PM file.
return 1;
