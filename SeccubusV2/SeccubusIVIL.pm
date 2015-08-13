# ------------------------------------------------------------------------------
# Copyright 2014 Frank Breedijk, Alex Smirnoff
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
package SeccubusIVIL;

=head1 NAME $RCSfile: SeccubusIVIL.pm,v $

This Pod documentation generated from the module SeccubusIVIL gives a list
of all functions within the module.

=cut

@ISA = ('Exporter');

@EXPORT = qw ( 
		load_ivil
	);

use SeccubusV2;
use SeccubusWorkspaces;
use SeccubusScans;
use SeccubusRuns;
use SeccubusFindings;
use SeccubusHostnames;

use strict;
use Carp;
use IVIL;

=head1 IVIL - Functions to import IVIL

=head2 load_ivil

This function will parse valid IVIL content and load the findings from it in 
the Seccubus database.

=over 2

=item Parameters

=over 4

=item ivil		- the IVIL content, this can either be a variable 
			  containing the IVIL text itself or the path to a file
			  containing the IVIL text

=item scanner		- (Optional) The name of the scanner to be used, if not value is given the value will be read from IVIL 

=item scanner_ver	- (Optional) Version of the scanner, if no value is given the value will be read from IVIL

=item timestamp		- (Optional) Timestamp of the scan in the format YYYYMMDDHHmmss, if no value is given the value will be read from ivil

=item workspace		- (Optional) Name of the workspace to load the findings into, if no value is given the value will be read from ivil. If the workspace does not exist, it will be created.

=item scan		- (Optional) Name of the scan to load the findings into, if not value is given the the value will be read from IVIL. If no value can be read, this defaults to the workspace name. If the scan does not exist it will be created.

=item print		- (Optional) Print progress to stdin

=back

=item Checks

Permission checks are performed by the individual workspace, scan and findings
routines. XML::Simple checks for valid XML syntax

=back

=item Returns

workspace_id	- ID of the workspace the vulnerabilities were loaded into
scan_id		- ID of the scan the vulnerabilities were loaded into
run_id		- ID of the run that was created for this scan

=cut

sub load_ivil($;$$$$$$) {
	my $ivil_xml_data = shift;
	my $scanner = shift;
	my $scanner_ver = shift;
	my $timestamp = shift;
	my $workspace = shift;
	my $scan = shift;
	my $print = shift;

	my $xml = new XML::Simple;
	my $ivil = $xml->XMLin($ivil_xml_data,
			      	forcearray	=> [ 'finding', 'references' ],
				KeyAttr		=> undef,
				SuppressEmpty	=> "",
	                      );

	if ( exists $ivil->{addressee} && $ivil->{addressee}->{program} eq "Seccubus" ) {
		$scan = $ivil->{addressee}->{programSpecificData}->{scan} unless $scan;
		$workspace = $ivil->{addressee}->{programSpecificData}->{workspace} unless $workspace;
	}
	confess "Unable to determine workspace" unless $workspace;
	$scan = $workspace unless $scan;
	
	$scanner = $ivil->{sender}->{scanner_type} unless $scanner;
	$scanner_ver = $ivil->{sender}->{version} unless $scanner_ver;

	$timestamp = $ivil->{sender}->{timestamp} unless $timestamp;
	confess "Unable to determine timestamp" unless $timestamp;

	$timestamp .= "00" if  $timestamp =~ /^\d{12}$/;
	confess "Timestamp: '$timestamp' is invalid" unless $timestamp =~ /^\d{14}$/;
	
	# This bocks gets the ID from and/or creates the workspace, scan and run
	my $workspace_id = get_workspace_id("$workspace");
	unless ( $workspace_id ) {
		$workspace_id = create_workspace($workspace);
	}
	my $scan_id = get_scan_id($workspace_id, $scan);
	unless ( $scan_id ) {
		confess "Unable to determine scanner" unless $scanner;
		$scan_id = create_scan($workspace_id, $scan, $scanner, "Please update manually");
	}
	my $run_id = update_run($workspace_id, $scan_id, $timestamp);

	# Now we create the findings

	if ( exists $ivil->{findings}->{finding} ) {
		my $count = @{$ivil->{findings}->{finding}};
		print "There are $count findings\n" if $print;
		foreach my $finding ( @{$ivil->{findings}->{finding}} ) {
			$finding->{severity} = 0 unless defined $finding->{severity};
			$finding->{severity} = 0 if $finding->{severity} eq "";
			# TODO: Seccubus currently does not handle the 
			# references as specified in the IVIL format
			update_finding(
				      	workspace_id	=> $workspace_id,
					run_id		=> $run_id,
					scan_id		=> $scan_id,
					host		=> $finding->{ip},
					port		=> $finding->{port},
					plugin		=> $finding->{id},
					finding		=> $finding->{finding_txt},
					severity	=> $finding->{severity},
				      );
			if ( $finding->{ip} =~ /^\d+\.\d+\.\d+\.\d+$/ ) {
				update_hostname($workspace_id, $finding->{ip}, $finding->{hostname});
			}
			print "Finding: $finding->{ip}, $finding->{port}, $finding->{id}\n$finding->{finding_txt}\n" if $print >1;
		}
	}
	return ($workspace_id, $scan_id, $run_id);
}

# Close the PM file.
return 1;
