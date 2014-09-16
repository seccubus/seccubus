# ------------------------------------------------------------------------------
# Copyright 2013 Frank Breedijk, Steve Launius
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
package SeccubusScans;

=head1 NAME $RCSfile: SeccubusScans.pm,v $

This Pod documentation generated from the module SeccubusScans gives a list of
all functions within the module.

=cut

use SeccubusDB;
use SeccubusRights;
use SeccubusNotifications;

@ISA = ('Exporter');

@EXPORT = qw ( 
		get_scan_id
		get_scans
		create_scan
		update_scan
		run_scan
	);

use strict;
use Carp;

sub get_scan_id($$;);
sub get_scans($;);
sub create_scan($$$$;$);
sub update_scan($$$$$;$);
sub run_scan($$;$$$);

=head1 Data manipulation - scans

=head2 create_scan

This function creates a scan with the name provided in the workspace

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item scanname - name of the scan

=item scanner_name - scanner name

=item scanner_param - scanner parameters

=item targets - targets of this scan (Optional)

=back 

=item Checks

User must be able to write workspace. Another scan with the same name must not
exist in the same workspace

=back

=cut

sub create_scan($$$$;$) {
	my $workspace_id = shift or confess "No workspace_id provided";
	my $scanname = shift or confess "No scanname provide to getscanid";
	my $scanner_name = shift or confess "No scanner_name provided";
	my $scanner_param = shift or confess "No scanner parameters specified";
	my $targets = shift;

	if ( get_scan_id($workspace_id, $scanname) ) {
		die "A scan named '$scanname' already exists in workspace $workspace_id";
	}
	if ( may_write($workspace_id) ) {
		return sql( "return"	=> "id",
			    "query"	=> "INSERT INTO scans(
			    			name, 
						scannername, 
						scannerparam,
						workspace_id,
						targets)
					    VALUES(?, ?, ?, ?, ?);
					   ",
			    "values"	=> [$scanname, $scanner_name, $scanner_param, $workspace_id, $targets],
			  );
	} else {
		die "Permission denied";
	}
}

=head2 get_scan_id

This function returns the id of scan with a given name in a certain workspace

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item scanname - name of the scan

=back 

=item Checks

None

=back

=cut

sub get_scan_id($$;) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scanname = shift or die "No scanname provide to getscanid";

	return sql( "return"	=> "array",
		    "query"	=> "SELECT id from scans where name = ? and workspace_id = ?;",
		    "values"	=> [$scanname, $workspace_id],
		  );
}

=head2 get_scans

This function returns a reference to an array of arrays with scans (id, name, 
scannername, scannerparam, lastrun, total_runs, total_findings, targets)

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=back 

=item Checks

Must have at least read rights

=back

=cut

sub get_scans($;) {
	my $workspace_id = shift or die "No workspace_id provided";

	if ( may_read($workspace_id) ) {
		return sql( "return"	=> "ref",
			    "query"	=> "SELECT id, name, scannername, scannerparam,
			    		   (SELECT MAX(time) FROM runs WHERE runs.scan_id = scans.id) as lastrun,
			    		   (SELECT COUNT(*) FROM runs WHERE runs.scan_id = scans.id) as total_runs,
			    		   '' as total_findings,
					   targets,
					   workspace_id,
					   (SELECT COUNT(*) FROM notifications WHERE notifications.scan_id = scans.id) as total_notifications
			    		   FROM scans  
					   WHERE workspace_id = ?
					   ORDER BY NAME",
			    "values"	=> [$workspace_id],
		  );
	} else {
		return undef;
	}
}

=head2 update_scan

This function updates a scan with the data provided

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item scan_id - id of the scan

=item scanname - name of the scan

=item scanner_name - scanner name

=item scanner_param - scanner parameters

=item targets - targets of this scan (Optional)

=back 

=item Checks

User must be able to write workspace.
The scan must exist in the workspace.

=back

=cut

sub update_scan($$$$$;$) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_id = shift or die "No scan_id provided";
	my $scanname = shift or die "No scanname provide to getscanid";
	my $scanner_name = shift or die "No scanner_name provided";
	my $scanner_param = shift or die "No scanner parameters specified";
	my $targets = shift;

	if ( may_write($workspace_id) ) {
		return sql( "return"	=> "rows",
			    "query"	=> "UPDATE scans
			    		    SET name = ?, scannername = ?, 
					    scannerparam = ?, targets = ?
					    WHERE id = ? AND workspace_id = ?;
					   ",
			    "values"	=> [$scanname, $scanner_name, $scanner_param, $targets, $scan_id, $workspace_id],
			  );
	} else {
		die "Permission denied";
	}
}


=head2 run_scan

This function runs the scan identified by the scan-id

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item scan_id - id of the scan to run

=item verbose - (optional) pass the -v flag the scan command

=item print - (optional) print scan output

=item nodelete - (optional) pass the --nodelete option to the scan command

=back

=item Checks

User must be able to write workspace. The scan must exist in the workspace.

=back

=cut

sub run_scan($$;$$$) {
	my $workspace_id = shift;
	my $scan_id = shift;
	my $verbose = shift;
	my $print = shift;
	my $nodelete = shift;

	# Bug #37 - @HOSTS gets expanded to /tmp/seccus.hosts.PID in stead of 
	# /tmp/seccubus.hosts.PID
	my $tempfile = "/tmp/seccubus.hosts.$$";
	if ( may_write($scan_id) ) {
		my @scan = sql( "return"	=> "array",
				"query"	=> "
					SELECT scans.name, scannername, 
					scannerparam, targets, workspaces.name
					FROM scans, workspaces
					WHERE scans.workspace_id = workspaces.id
					AND workspaces.id = ?
					AND scans.id = ?",
				"values"	=> [$workspace_id, $scan_id]
			      );
		if ( @scan ) {
			my ( $scanname, $scanner, $param, $targets, $workspace ) = @scan;
			my $config = SeccubusV2::get_config();
			if ( ! -e $config->{paths}->{scanners} . "/$scanner/scan" ) {
				die "Scan script for $scanner is not installed";
			}
			if ( $param =~ /\@HOSTS/ ) {
				open TMP, ">$tempfile" or die "Unable to open $tempfile for write";
				print TMP "$targets\n";
				close TMP;
				$param =~ s/\@HOSTS/$tempfile/g;
			}
			if ( $param =~ /\$HOSTS/ ) {
				$param =~ s/\$HOSTS/$targets/g;
			}
			if ( $param =~ /\$WORKSPACE/ ) {
				$param =~ s/\$WORKSPACE/$workspace/g;
			}
			if( $param =~ /\@ASSETS/ ){

				my $assets = join ' ', map { $_->[0]; } @{sql(
					"query"=>"SELECT a.ip
						from asset_hosts a, asset2scan b
						where b.asset_id = a.asset_id and b.scan_id = ? 
						group by a.ip",
					'values'=>[$scan_id]
					)};
				open TMP, ">$tempfile" or die "Unable to open $tempfile for write";
				print TMP "$assets\n";
				close TMP;
				$param =~ s/\@ASSETS/$tempfile/g;
			}
			if ( $param =~ /\$SCAN/ ) {
				$param =~ s/\$SCAN/$scanname/g;
			}
			# Bug #42 - Scan parameters --workspace and --scan 
			# should be added automatically
			if ( $param !~ /(\-sc|\-\-scan)[\s=]/ ) {
				# Bug #57 - Scan names with two words not 
				# handled correctly
				$param = "--scan '$scanname' $param";
			}
			if ( $param !~ /(\-ws|\-\-workspace)[\s=]/ ) {
				# Bug #57 - Scan names with two words not 
				# handled correctly
				$param = "--workspace '$workspace' $param";
			}
			my $cmd = $config->{paths}->{scanners} . "/$scanner/scan $param";
			if ( $verbose == -1 ) {
				$cmd .= " -q";
			} else {
				$cmd .= " -v" x $verbose;
			}
			# Nodelete (issue #14)
			if ( $nodelete ) {
				$cmd .= " --nodelete";
			}

			# Sending pre scan notifications
			print "Sending notifications for scan start...\n" if $print;
			my $sent = do_notifications($workspace_id, $scan_id, 1);
			print "$sent notification(s) sent\n" if $print;

			# Starting the actual scan
			print "cmd: $cmd\n" if $print;
			my $result = "cmd: $cmd\n";
			open CMD, "$cmd |" or die "Unable to open pipe to '$cmd'";
			while (<CMD>) {
				$result .= $_;
				print $_ if $print;
			}
			close CMD;
			unlink $tempfile;

			# Sending post scan notifications
			print "Sending notifications for scan end...\n" if $print;
			$sent = do_notifications($workspace_id, $scan_id, 2);
			print "$sent notification(s) sent\n" if $print;

			return $result;
		} else {
			die "Scan $scan_id in workspace $workspace_id does not exist";
		}
	} else {
		die "You do not have permission to write in workspace $workspace_id";
	}
}

# Close the PM file.
return 1;
