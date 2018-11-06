# ------------------------------------------------------------------------------
# Copyright 2011-2018 Frank Breedijk, Steve Launius, Artien Bel (Ar0xA), Petr
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
package Seccubus::Scans;

=head1 NAME $RCSfile: SeccubusScans.pm,v $

This Pod documentation generated from the module SeccubusScans gives a list of
all functions within the module.

=cut

use strict;
use Exporter;
use SeccubusV2;
use Seccubus::DB;
use Seccubus::Rights;
use Seccubus::Notifications;
use Data::Dumper;

our @ISA = ('Exporter');

our @EXPORT = qw (
	get_scan_id
	get_scans
	create_scan
	update_scan
	run_scan
);

use Carp;

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

=item password = scanner password (Optional)

=item targets - targets of this scan (Optional)

=back

=item Checks

User must be able to write workspace. Another scan with the same name must not
exist in the same workspace

=back

=cut

sub create_scan {
	my $workspace_id = shift or confess "No workspace_id provided";
	my $scanname = shift or confess "No scanname provide to getscanid";
	my $scanner_name = shift or confess "No scanner_name provided";
	my $scanner_param = shift or confess "No scanner parameters specified";
	my $password = shift;
	my $targets = shift;

	if ( get_scan_id($workspace_id, $scanname) ) {
		confess "A scan named '$scanname' already exists in workspace $workspace_id";
	}
	if ( may_write($workspace_id) ) {
		return sql( "return"	=> "id",
			    "query"	=> "INSERT INTO `scans` (
			    			`name`,
						`scannername`,
						`scannerparam`,
						`password`,
						`workspace_id`,
						`targets`)
					    VALUES(?, ?, ?, ?, ?, ?);
					   ",
			    "values"	=> [$scanname, $scanner_name, $scanner_param, $password, $workspace_id, $targets],
			  );
	} else {
		confess "Permission denied";
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

sub get_scan_id {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scanname = shift or die "No scanname provide to getscanid";

	return sql( "return"	=> "array",
		    "query"	=> "SELECT `id` from `scans` where `name` = ? and `workspace_id` = ?;",
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

=item scan_id - optional id of the single scan to read back

=back

=item Checks

Must have at least read rights

=back

=cut

sub get_scans {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_id = shift;

	if ( may_read($workspace_id) ) {
		my $values = [ $workspace_id ];
		my $sql = "	SELECT `id`, `name`, `scannername`, `scannerparam`,
					(SELECT MAX(`time`) FROM `runs` WHERE `runs`.`scan_id` = `scans`.`id`) as `lastrun`,
					(SELECT COUNT(*) FROM `runs` WHERE `runs`.`scan_id` = `scans`.`id`) as `total_runs`,
					'' as `total_findings`,
					`targets`,
					`workspace_id`,
					(SELECT COUNT(*) FROM `notifications` WHERE `notifications`.`scan_id` = `scans`.`id`) as `total_notifications`,
					`password`
					FROM `scans`
					WHERE `workspace_id` = ?
		";
		if ( $scan_id ) {
			$sql .= " AND `scans`.`id` = ? ";
			push @$values, $scan_id;
		}
		$sql .= " ORDER BY `name` ";
		return sql( "return"	=> "ref",
					"query"		=> $sql,
					"values"	=> $values,
		);
	} else {
		return;
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

=item password - scanner password (Optional)

=item targets - targets of this scan (Optional)

=back

=item Checks

User must be able to write workspace.
The scan must exist in the workspace.

=back

=cut

sub update_scan {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_id = shift or die "No scan_id provided";
	my $scanname = shift or die "No scanname provide to getscanid";
	my $scanner_name = shift or die "No scanner_name provided";
	my $scanner_param = shift or die "No scanner parameters specified";
	my $password = shift;
	my $targets = shift;
	if ( may_write($workspace_id) ) {
		my @existing = sql(
			return 		=> "array",
			query		=> "
				SELECT COUNT(*)
				FROM 	`scans`
				WHERE 	`workspace_id` = ? AND
						`id` <> ? AND
						`name` = ?",
			values 		=> [ $workspace_id, $scan_id, $scanname ]
		);
		if ( $existing[0] > 0  ) {
			die "A scan named $scanname already exists in this workspace";
		}
		if (length($password) > 0 ) {
			return sql( "return"	=> "rows",
				    "query"	=> "UPDATE `scans`
				    		    SET `name` = ?, `scannername` = ?,
						    `scannerparam` = ?, `password` = ?, `targets` = ?
						    WHERE `id` = ? AND `workspace_id` = ?;
						   ",
				    "values"	=> [$scanname, $scanner_name, $scanner_param, $password, $targets, $scan_id, $workspace_id],
				  );
		} else {
			return sql( "return"	=> "rows",
				    "query"	=> "UPDATE `scans`
				    		    SET `name` = ?, `scannername` = ?,
						    `scannerparam` = ?, `targets` = ?
						    WHERE `id` = ? AND `workspace_id` = ?;
						   ",
				    "values"	=> [$scanname, $scanner_name, $scanner_param, $targets, $scan_id, $workspace_id],
				  );

		}
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

sub run_scan {
	my $workspace_id = shift;
	my $scan_id = shift;
	my $verbose = shift;
	my $print = shift;
	my $nodelete = shift;

	# Bug #37 - @HOSTS gets expanded to /tmp/seccus.hosts.PID in stead of
	# /tmp/seccubus.hosts.PID
	my $tempfile = "/tmp/seccubus.hosts.$$";
	if ( may_write($workspace_id) ) {
		my @scan = sql( "return"	=> "array",
				"query"	=> "
					SELECT `scans`.`name`, `scannername`,
					`scannerparam`, `password`, `targets`, `workspaces`.`name`
					FROM `scans`, `workspaces`
					WHERE `scans`.`workspace_id` = `workspaces`.`id`
					AND `workspaces`.`id` = ?
					AND `scans`.`id` = ?",
				"values"	=> [$workspace_id, $scan_id]
			      );
		if ( @scan ) {
			my ( $scanname, $scanner, $param, $password, $targets, $workspace ) = @scan;
			my $config = SeccubusV2::get_config();
			if ( ! -e $config->{paths}->{scanners} . "/$scanner/scan" ) {
				die "Scan script for $scanner is not installed at " . $config->{paths}->{scanners} . "/$scanner/scan";
			}
			if ($scanner =~ /^Nessus/ || $scanner eq "OpenVAS") {
				$param = $param .' --pw \''. $password. '\' ';
			};
			if ( $param =~ /\@HOSTS/ ) {
				open(my $TMP, ">", "$tempfile") or die "Unable to open $tempfile for write";
				print $TMP "$targets\n";
				close $TMP;
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
				open(my $TMP, ">", "$tempfile") or die "Unable to open $tempfile for write";
				print $TMP "$assets\n";
				close $TMP;
				$param =~ s/\@ASSETS/$tempfile/g;
			}

			if( $param =~ /\$ASSETS/ ){

				my $assets = join ' ', map { $_->[0]; } @{sql(
					"query"=>"SELECT `a`.`ip`
						from `asset_hosts` `a`, `asset2scan` `b`
						where `b`.`asset_id` = `a`.`asset_id` and `b`.`scan_id` = ?
						group by `a`.`ip`",
					'values'=>[$scan_id]
					)};
				$param =~ s/\$ASSETS/$assets/g;
			}

			if ( $param =~ /\$SCAN/ ) {
				$param =~ s/\$SCAN/$scanname/g;
			}
			my $printparam = $param;
			if ( $param =~ /\$PASSWORD/ ) {
				$param =~ s/\$PASSWORD/$password/g;
				$printparam =~ s/\$PASSWORD/********/g;
			}
			# Bug #42 - Scan parameters --workspace and --scan
			# should be added automatically
			if ( $param !~ /(\-sc|\-\-scan)[\s=]/ ) {
				# Bug #57 - Scan names with two words not
				# handled correctly
				$param = "--scan '$scanname' $param";
				$printparam = "--scan '$scanname' $printparam";
			}
			if ( $param !~ /(\-ws|\-\-workspace)[\s=]/ ) {
				# Bug #57 - Scan names with two words not
				# handled correctly
				$param = "--workspace '$workspace' $param";
				$printparam = "--workspace '$workspace' $printparam";
			}
			my $cmd = $config->{paths}->{scanners} . "/$scanner/scan $param";
			my $printcmd = $config->{paths}->{scanners} . "/$scanner/scan $printparam";
			if ( $verbose == -1 ) {
				$cmd .= " -q";
				$printcmd .= " -q";
			} else {
				$cmd .= " -v" x $verbose;
				$printcmd .= " -v" x $verbose;
			}
			# Nodelete (issue #14)
			if ( $nodelete ) {
				$cmd .= " --nodelete";
				$printcmd .= " --nodelete";
			}

			# Sending pre scan notifications
			print "Sending notifications for scan start...\n" if $print;
			my $sent = do_notifications($workspace_id, $scan_id, 1);
			print "$sent notification(s) sent\n" if $print;

			# Starting the actual scan
			print "cmd: $printcmd\n" if $print;
			my $result = "cmd: $printcmd\n";
			open( my $CMD, "-|", $cmd) or die "Unable to open pipe to '$printcmd'";
            select $CMD; $| = 1 if $print;
            select STDOUT; $| = 1 if $print;
			while (<$CMD>) {
				$result .= $_;
				print $_ if $print;
			}
			close $CMD;
            select STDOUT; $| = 0 if $print;
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
