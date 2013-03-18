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
package SeccubusFindings;

=head1 NAME $RCSfile: SeccubusFindings.pm,v $

This Pod documentation generated from the module SeccubusFindings gives a list
of all functions within the module.

=cut

use SeccubusDB;
use SeccubusRights;
use SeccubusUsers;
use Algorithm::Diff qw( diff );

@ISA = ('Exporter');

@EXPORT = qw ( 
		get_findings
		get_status
		get_finding
		update_finding
		process_status
		diff_finding
	);

use strict;
use Carp;

sub get_findings($;$$);
sub get_status($$;$);
sub get_finding($$;);
sub update_finding(@);
sub diff_finding($$$$$;);

=head1 Data manipulation - findings

=head2 get_findings

This function returns a reference to an array of findings
(id, host, hostname, port, plugin, findingl, remark, severity, status, status_txt)

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item scan_id - id of the scan if 0 this parameter is disregarded

=item filter - reference to a hash containing filters

=back 

=item Checks

Must have at least read rights

=back

=cut

sub get_findings($;$$) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_id = shift;
	my $filter = shift;

	if ( may_read($workspace_id) ) {
		my $params = [ $workspace_id, $workspace_id ];

		my $query = "
			SELECT DISTINCT findings.id, host, host_names.name as hostname, 
				port, plugin, finding, remark, 
				findings.severity as severity_id, 
				severity.name as severity_name, 
				findings.status as status_id, 
				finding_status.name as status,
				findings.scan_id as scan_id
			FROM
				findings
			LEFT JOIN host_names on host_names.ip = host and host_names.workspace_id = ?
			LEFT JOIN severity on findings.severity = severity.id
			LEFT JOIN finding_status on findings.status = finding_status.id
			WHERE
				findings.workspace_id = ?";
		if ( $scan_id != 0 ) {
			$query .= " AND findings.scan_id = ? ";
			push @$params, $scan_id;
		}

		if ( $filter ) {
			if ( $filter->{status} ) {
				$query .= " AND status = ? ";
				push @$params, $filter->{status};
			}
			if ( $filter->{host} ) {
				$filter->{host} =~ s/\*/\%/;
				$query .= " AND host LIKE ? ";
				push @$params, $filter->{host};
			}
			if ( $filter->{hostname} ) {
				$filter->{hostname} =~ s/\*/\%/;
				$filter->{hostname} = "%$filter->{hostname}%";
				$query .= " AND host_names.name LIKE ? ";
				push @$params, $filter->{hostname};
			}
			if ( $filter->{port} ) {
				$query .= " AND port = ? ";
				push @$params, $filter->{port};
			}
			if ( $filter->{plugin} ) {
				$query .= " AND plugin = ? ";
				push @$params, $filter->{plugin};
			}
			if ( $filter->{severity} ) {
				$query .= " AND findings.severity = ? ";
				push @$params, $filter->{severity};
			}
			if ( $filter->{finding} ) {
				$query .= " AND finding LIKE ? ";
				push @$params, "%" . $filter->{finding} . "%";
			}
			if ( $filter->{remark} ) {
				$query .= " AND remark LIKE ?";
				push @$params, "%" . $filter->{remark} . "%";
			}
		}
		
		$query .= " ORDER BY host, port, plugin ";


		return sql( "return"	=> "ref",
			    "query"	=> $query,
			    "values"	=> $params,
		          );
	} else {
		die "Permission denied!";
	}
}

=head2 get_status

This function returns an array of statusses and the amount of findings in it, 
given a specific filter

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item scan_ids - reference to an araay of scan ids

=item filter - reference to a hash containing filters

=back 

=item Checks

Must have at least read rights

=back

=cut

sub get_status($$;$) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_ids = shift;
	my $filter = shift;

	die "Must specify scanids for function get_status" unless @$scan_ids;

	if ( may_read($workspace_id) ) {
		$filter = undef;
		my $params = [ $workspace_id, $workspace_id ];

		my $query = "
			SELECT	finding_status.id, finding_status.name, count(findings.id)
			FROM
				finding_status
			LEFT JOIN findings on findings.status =  finding_status.id
			LEFT JOIN host_names on host_names.ip = host and host_names.workspace_id = ?
			LEFT JOIN severity on findings.severity = severity.id
			WHERE
				findings.workspace_id = ?";

		#$query .= " AND findings.scan_id in ( ? ";
		#push @$params, shift ( @$scan_ids );
		#while ( @$scan_ids ) {
		#	$query .= " , ? ";
		#	push @$params, shift ( @$scan_ids );
		#}
		#$query .= " ) ";

		if ( $filter ) {
			if ( $filter->{host} ) {
				$filter->{host} =~ s/\*/\%/;
				$query .= " AND host LIKE ? ";
				push @$params, $filter->{host};
			}
			if ( $filter->{hostname} ) {
				$filter->{hostname} =~ s/\*/\%/;
				$filter->{hostname} = "%$filter->{hostname}%";
				$query .= " AND host_names.name LIKE ? ";
				push @$params, $filter->{hostname};
			}
			if ( $filter->{port} ) {
				$query .= " AND port = ? ";
				push @$params, $filter->{port};
			}
			if ( $filter->{plugin} ) {
				$query .= " AND plugin = ? ";
				push @$params, $filter->{plugin};
			}
			if ( $filter->{severity} ) {
				$query .= " AND findings.severity = ? ";
				push @$params, $filter->{severity};
			}
			if ( $filter->{finding} ) {
				$query .= " AND finding LIKE ? ";
				push @$params, "%" . $filter->{finding} . "%";
			}
			if ( $filter->{remark} ) {
				$query .= " AND remark LIKE ?";
				push @$params, "%" . $filter->{remark} . "%";
			}
		}
		
		$query .= " ORDER BY finding_status.id";

		return sql( "return"	=> "ref",
			    "query"	=> $query,
			    "values"	=> $params,
		          );
	} else {
		die "Permission denied!";
	}
}

=head2 get_finding

This function returns a reference to an array of changes of findings
(id, finding.id, host, hostname, port, plugin, finding, remark, severity, severity_name, status, status_txt, user_id, username, time, runtime)

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item finding_id - id of the finding

=back 

=item Checks

Must have at least read rights

=back

=cut

sub get_finding($$;) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $finding_id = shift or die "No finding_id provided";

	if ( may_read($workspace_id) ) {
		my $params = [ $workspace_id, $workspace_id ];

		my $query = "
			SELECT 	finding_changes.id, findings.id, host, 
				host_names.name, port, plugin, 
				finding_changes.finding, 
				finding_changes.remark,
				finding_changes.severity, severity.name, 
				finding_changes.status, finding_status.name,
				user_id, username, finding_changes.time as changetime, 
				runs.time as runtime
			FROM
				finding_changes LEFT JOIN users on (finding_changes.user_id = users.id ),
				finding_status, severity,
				runs, findings LEFT JOIN host_names ON findings.host = host_names.ip
			WHERE
				findings.workspace_id = ? AND
				findings.id = ? AND
				findings.id = finding_changes.finding_id AND
				finding_changes.severity = severity.id AND
				finding_changes.status = finding_status.id AND
				runs.id = finding_changes.run_id 
			ORDER BY finding_changes.time DESC
			";


		return sql( "return"	=> "ref",
			    "query"	=> $query,
			    "values"	=> [ $workspace_id, $finding_id ]
		          );
	} else {
		die "Permission denied!";
	}
}

=head2 update_finding

This function updates or creates a finding in the database. It takes a named 
parameter list with the following parameters:

=over 2

=item Parameters

=over 4

=item finding_id  - If set, the function will try to update this finding

=item workspace_id  - Manditory

=item run_id      

=item scan_id     - Manditory if no finding_id is given

=item host        - Manditory if no finding_id is given

=item port        - Manditory if no finding id is given

=item plugin      - Manditory if no finding_id is given

=item finding     - The actual finding text

=item remark      - 

=item severity    - 0 if not given and finding gets created

=item status      - NEW if not given and finding gets created

=item overwrite	  - 0 means append remark, 1 (default) means overwrite remark. 

Append only happens if the finding exists

=back

=item Checks

Madatory parameters are checked. User must have write permission.

=cut

sub update_finding(@) {
	my %arg = @_;

	# Check if the user has write permissions
	die "You don't have write permissions for this workspace!" unless may_write($arg{workspace_id});

	# Check for mandatory parameters
	foreach my $param ( qw(workspace_id) ) {
		die "Manditory parameter $param missing" unless exists $arg{$param};
	}
	# Check if status is a legal value
	if ( exists $arg{status} ) {
		unless ( ($arg{status} >=  1 && $arg{status} <= 6) || $arg{status} == 99 ) {
			die "Illegal status value $arg{status}";
		}
	}

	if ( ! $arg{finding_id} ) {
		# If we don't have a finding ID there are additional mandatory
		# parameters.
		foreach my $param ( qw(scan_id run_id host port plugin finding) ) {
			die "Manditory parameter $param missing" unless exists $arg{$param};
		}

		# Lets try to find out if a finding allready exists for this 
		# host port plugin combination
		$arg{finding_id} = sql ( 
			"return"	=> "array",
			"query"		=> "SELECT id 
					    FROM findings 
					    WHERE workspace_id = ? and scan_id = ? AND host = ? AND port = ? AND plugin = ?",
			"values"	=> [ $arg{workspace_id}, $arg{scan_id}, $arg{host}, $arg{port}, $arg{plugin} ],
			);

	}

	# Lets set some default values
	$arg{overwrite} = 1 if not exists $arg{overwrite};
	$arg{status} = 1 unless $arg{status} or $arg{finding_id};
	$arg{severity} = 0 unless exists $arg{severity} or $arg{finding_id};

	my ( @fields, @values );
	foreach my $field ( qw(scan_id host port plugin finding severity status run_id) ) {
		if ( exists($arg{$field}) ) {
			push @fields, $field;
			push @values, $arg{$field};
		}
	}
	if ( $arg{finding_id} ) {
		# We need to update the record
		my $query = "update findings set ";
		$query .= join " = ? , ", @fields;
		$query .= " = ?";
		if ( exists $arg{remark} ) {
			if ( $arg{overwrite} ) {
				$query .= ", remark = ? ";
			} else {
				$query .= ", remark = CONCAT_WS('\n', remark, ?) ";
			}
			push @values, $arg{remark};
		}
		$query .= "where id = ? and workspace_id = ?";
		sql( "return"	=> "handle",
		     "query" 	=> $query,
		     "values"	=> [ @values, $arg{finding_id}, $arg{workspace_id} ]
		   );
	} else {
		# We need to create the record
		push @fields, "workspace_id";
		push @values, $arg{workspace_id};
		if ( exists($arg{remark}) ) {
			push @fields, "remark";
			push @values, $arg{remark};
		}
		my $count = @fields;
		$count--;
		my $query = "insert into findings(";
		$query .= join ",", @fields;
		$query .= ") values (";
		$query .= "? ," x $count;
		$query .= "? );";
		$arg{finding_id} = sql( "return"	=> "id",
					"query"		=> $query,
					"values"	=> \@values,
				      );
	}
	# Create an audit record
	create_finding_change($arg{finding_id});
	return $arg{finding_id};
}

=head2 create_finding_change (hidden)

This function adds a record to the finding_changes table.

=over 2

=item Parameters

=over 4

=item finding_id  - Manditory

=back

=item Returns

THe inserted id.

=item Checks

None, this is a hidden function that will not be called through the API. All 
checking should have been doine a higher levels.

=back

=cut

sub create_finding_change($:) {
	my $finding_id = shift or die "No fidnings_id given";
	my $user_id = get_user_id($ENV{REMOTE_USER});

	my @data = sql( "return"	=> "array",
			"query"		=> "select status, finding, remark, severity, run_id from findings where id = ?",
			"values"	=> [ $finding_id ],
		      );
	sql( "return"	=> "id",
	     "query"	=> "insert into finding_changes(finding_id, status, finding, remark, severity, run_id, user_id) values (?, ?, ?, ?, ?, ?, ?)",
	     "values"	=> [ $finding_id, @data, $user_id ],
	   );
}

=head2 process_status

This function calculates new statusses based on changes in the scan. This 
function should be run immediately after a new scan is loaded into the system
parallel editing may interfere

=over 2

=item Parameters

=over 4

=item workscape_id - Workspace ID

=item scan_id - Scan ID number

=item run_id - Run ID number of the latest scan

=item verbose - Optional paarameter that sets the verbosity of the processing

=back

=item Returns

The number of changed findings

=item Checks

The user must have write rights on the workspace

=back

=cut

sub process_status($$$;$) {
	my $workspace_id = shift;
	my $scan_id = shift;
	my $run_id = shift;
	my $verbose = shift;

	my $ref;

	# Find the ids that need to be set to GONE, basically these are the 
	# findings that currently have the status NEW (1), CHANGED(2), OPEN(3), 
	# or NO ISSUE (4) (so basically 4 or lower) and isn't associated with 
	# the current run
	$ref = sql( "return"	=> "ref",    
		    "query"	=> "SELECT	id
		      		    FROM	findings
				    WHERE 	workspace_id = ? AND
				    		scan_id = ? AND
						( status <= 4 ) AND
						run_id <> ?",
		      "values"	=> [ $workspace_id, $scan_id, $run_id ],
		    );

	foreach my $id ( @{$ref} ) {
		$id = $$id[0]; # Get the id from the arrayref;
		print "Set finding $id to status GONE\n" if $verbose;
		update_finding(
			"workspace_id"	=> $workspace_id,
			"finding_id"	=> $id,
			"status"	=> 5,
		);
	}

	# Find the ids that need to be set to NEW, basically these are the 
	# findings that currently have the status GONE (5) or CLOSED (6) but 
	# are associated with the current run (as provided by the user)
	$ref = sql( "return"	=> "ref",    
		    "query"	=> "SELECT	id
		      		    FROM	findings
				    WHERE 	workspace_id = ? AND
				    		scan_id = ? AND
						( status = 5 OR status = 6 ) AND
						run_id = ?",
		      "values"	=> [ $workspace_id, $scan_id, $run_id ],
		    );
	foreach my $id ( @{$ref} ) {
		$id = $$id[0]; # Get the id from the arrayref;
		print "Set finding $id to status NEW\n" if $verbose;
		update_finding(
			"workspace_id"	=> $workspace_id,
			"finding_id"	=> $id,
			"status"	=> 1,
		);
	}

	# Find out if there has been a previous run
	my $previous_run = sql( return	=> "array",
				query	=> "SELECT	MAX(id) 
					    FROM	runs
					    WHERE	scan_id = ? AND
					    		id <> ?",
				values	=> [ $scan_id, $run_id ] 
			      );
	print "Previous run is: $previous_run\n" if $verbose;
	if ( $previous_run ) {		# No need to check for changes if this
					# is the first run

		# Find the ids that need to be tested for changes. basically 
		# these are the findings with status OPEN(3), or NO ISSUE (4) 
		# associated with the current run
		$ref = sql( "return"	=> "ref",    
			    "query"	=> "SELECT	id
			      		    FROM	findings
					    WHERE 	workspace_id = ? AND
					    		scan_id = ? AND
							( status = 3 OR status = 4 ) AND
							run_id = ?",
			      "values"	=> [ $workspace_id, $scan_id, $run_id ],
			    );
		foreach my $id ( @{$ref} ) {
			$id = $$id[0]; # Get the id from the arrayref;
			print "Checking finding $id for changes\n" if $verbose;
			# Get differences in diff format
			my @diff = diff_finding("diff", $workspace_id, $id, $run_id, $previous_run); 
			# update the finding to changed if there is a diff
			if ( @diff[0] eq "NEW" ) {
				# Handle a erronious situation
				print "Finding wasn't present in previous run, while it should have been, resetting to NEW\n" if $verbose;
				update_finding (
					"workspace_id"  => $workspace_id,
					"finding_id"    => $id,
					"status"        => 1,
				);
			} elsif ( @diff ) {
				update_finding (
					"workspace_id"  => $workspace_id,
					"finding_id"    => $id,
					"status"        => 2,
				);
			}
		}
	}
}

=head2 diff_finding

This function calculates the differences between two runs of a finding.

=over 2

=item Parameters

=over 4

=item type - Type of output

"diff" output in diff format. Returns and array.
"html" output in HTML format. See wiki.
"txt" output in text format.

=item workspace_id - ID of the workspace

=item finding_id - ID of the finding to diff

=item this_run - ID of the current run

=item prev_run - ID of the previous run

=back

=item Returns

undef if there are no differences, otherwise the diff in the format requested

=item Checks

Must be able to read the workspaced

=back

=cut

sub diff_finding($$$$$;) {
	my $type = shift;
	my $workspace_id = shift;
	my $finding_id = shift;
	my $this_run = shift;
	my $prev_run =shift;

	if ( may_read($workspace_id) ) {
		my @findings = sql( return	=> "array",
				    query	=> "SELECT id
				    		    FROM findings
						    WHERE id = ? 
						    AND workspace_id = ?",
				    values	=> [ $finding_id, $workspace_id ],
				  );
		die "There is no finding '$finding_id' in workspace '$workspace_id'" unless @findings;
		my @current = sql( return	=> "array",
				   query	=> "SELECT finding
				   		    FROM finding_changes
						    WHERE finding_id = ?
						    AND run_id = ?
						    ORDER BY time 
						    LIMIT 1",
				   values	=> [ $finding_id, $this_run ],
				 );
		my @prev = sql( return	=> "array",
				query	=> "SELECT finding
				   	    FROM finding_changes
					    WHERE finding_id = ?
					    AND run_id = ?
					    ORDER BY time 
					    LIMIT 1",
				   values	=> [ $finding_id, $prev_run ],
				 );
		die "Unable to load current finding, ws: $workspace_id, id: $finding_id, run: $this_run" unless ( @current );
		if ( @prev ) {
			@current = split(/\n/, $current[0]);
			@prev = split(/\n/, $prev[0]);
			my @diff = diff(\@prev, \@current);
	
			if ( $type eq "diff" ) {
				return @diff;
			} elsif ( $type eq "txt" ) {
				return join "\n", @diff;
			} elsif ( $type eq "html" ) {
				return join "<br>\n", @diff;
			} else {
				die "Unknown return type '$type'";
			}
		} else {
			# There is no previous run, this should technically not
			# happen, but can apparently happen with imported scans
			return ( "NEW" );
		}
	} else {
		die("You are not allowed to read workspace '$workspace_id'")
	}
}

# Close the PM file.
return 1;
