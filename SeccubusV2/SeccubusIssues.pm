# ------------------------------------------------------------------------------
# Copyright 2015 Frank Breedijk, Steve Launius, Petr
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
package SeccubusIssues;

=head1 NAME $RCSfile: SeccubusFindings.pm,v $

This Pod documentation generated from the module SeccubusFindings gives a list
of all functions within the module.

=cut

use SeccubusDB;
use SeccubusRights;
use SeccubusUsers;
use Data::Dumper;

@ISA = ('Exporter');

@EXPORT = qw ( 
	update_issue
	get_issues	
	get_issue
	issue_finding_link
);

use strict;
use Carp;

sub update_issue(@);
sub create_issue_change($);
sub get_issues($;$);
sub get_issue($$);
sub issue_finding_link($$$;$);

=head1 Data manipulation - issues

=head2 update_issue

This function updates or creates a finding in the database. It takes a named 
parameter list with the following parameters:

=over 2

=item Parameters (name parameter list)

=over 4

=item issue_id  	- If set, the function will try to update this issue

=item workspace_id  - Manditory

=item name        	- Name of the issue

=item ext_ref       - External reference (e.g. ticket number)

=item description   - Description of the issue

=item severity    	- 0 if not given and finding gets created

=item status      	- Open if not given and finding gets created

=item findings 		- List of findings to add to the issue

=item findings_remove
                    - List of findings to remove from the issue

=back

=item Checks

Madatory parameters are checked. User must have write permission.

=cut

sub update_issue(@) {
	my %arg = @_;
	my $return = -1;

	# Check for mandatory parameters
	foreach my $param ( qw(workspace_id) ) {
		die "Manditory parameter $param missing" unless exists $arg{$param};
	}

	# Check if the user has write permissions
	die "You don't have write permissions for this workspace!" unless may_write($arg{workspace_id});

	# Check if status is a legal value
	if ( exists $arg{status} ) {
		unless ($arg{status} >=  1 && $arg{status} <= 2)  {
			die "Illegal status value $arg{status}";
		}
	} else {
		$arg{status} = 1 unless $arg{issue_id};
	}

	# Check if severity is a legal value
	if ( exists $arg{severity} ) {
		unless ($arg{severity} >=  0 && $arg{severity} <= 4)  {
			die "Illegal severity value $arg{severity}";
		}
	} else {
		$arg{severity} = 0 unless $arg{issue_id};
	}

	my ( @fields, @values );
	foreach my $field ( qw(name ext_ref description severity status) ) {
		if ( exists($arg{$field}) ) {
			push @fields, $field;
			push @values, $arg{$field};
		}
	}
	if ( $arg{issue_id} ) {
		# We need to update the record
		if ( @fields ) {
			my $query = "update issues set ";
			$query .= join " = ? , ", @fields;
			$query .= " = ?";
			$query .= "where id = ? and workspace_id = ?";
			sql( "return"	=> "handle",
			     "query" 	=> $query,
			     "values"	=> [ @values, $arg{issue_id}, $arg{workspace_id} ]
			);
		}

		$return = get_issues($arg{workspace_id}, $arg{issue_id});
	} else {
		# We need to create the record
		push @fields, "workspace_id";
		push @values, $arg{workspace_id};
		my $count = @fields;
		$count--;
		my $query = "insert into issues(";
		$query .= join ",", @fields;
		$query .= ") values (";
		$query .= "? ," x $count;
		$query .= "? );";
		$return = sql( "return"	=> "id",
					"query"		=> $query,
					"values"	=> \@values,
		);
		$arg{issue_id} = $return;
	}
	# Create an audit record
	create_issue_change($arg{issue_id});

	# Link findings
	if ( $arg{findings} ) {
		foreach my $finding_id ( split( /\0/, $arg{findings}) ) {
			issue_finding_link($arg{workspace_id}, $arg{issue_id}, $finding_id, 0);
		}
	}

	if ( $arg{findings_remove} ) {
		foreach my $finding_id ( split( /\0/, $arg{findings_remove}) ) {
			issue_finding_link($arg{workspace_id}, $arg{issue_id}, $finding_id, 1);
		}		
	}

	return $return;
}

=head2 create_issue_change (hidden)

This function adds a record to the finding_changes table.

=over 2

=item Parameters

=over 4

=item issue_id  - Mandatory

=back

=item Returns

The inserted id.

=item Checks

None, this is a hidden function that will not be called through the API. All 
checking should have been doine a higher levels.

=back

=cut

sub create_issue_change($) {
	my $issue_id = shift or die "No issue_id given";
	my $user_id = get_user_id($ENV{REMOTE_USER});

	my @new_data = sql( "return"	=> "array",
		"query"		=> "select name, ext_ref, description,severity, status from issues where id = ?",
		"values"	=> [ $issue_id ],
	);
	my @old_data = sql( "return"	=> "array",
		"query"		=> "select name, ext_ref, description,severity, status from issue_changes where issue_id = ? order by time desc limit 1",
		"values"	=> [ $issue_id ],
	);
	#die Dumper @old_data;

	my $x = 0;
	my $diff = 0;
	while ( $x < @new_data && ! $diff ) {
		$diff = 1 if ( $old_data[$x] ne $new_data[$x]);
		$x++
	}

	my $id = 0;
	if ( $diff || 0 == @old_data) {
		$id = sql( 
			"return"	=> "id",
			"query"		=> "insert into issue_changes(issue_id, name, ext_ref, description, severity, status, user_id) values (?, ?, ?, ?, ?, ?, ?)",
		    "values"	=> [ $issue_id, @new_data, $user_id ],
		);
	}
	return $id;
}

=head2 get_issues

This function returns a reference to an array of issues

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=back 

=item Checks

Must have at least read rights

=back

=cut

sub get_issues($;$) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $issue_id = shift;

	if ( may_read($workspace_id) ) {
		my $params = [ $workspace_id ];

		my $query = "
			SELECT DISTINCT i.id, i.name, i.ext_ref, i.description, i.severity, severity.name, 
				i.status, issue_status.name
			FROM
				issues i
			LEFT JOIN severity on i.severity = severity.id
			LEFT JOIN issue_status on i.status = issue_status.id
			WHERE
				i.workspace_id = ?
		";
		if ( $issue_id ) {
			$query .= "AND i.id = ?";
			push @$params, $issue_id;
		}
		$query .= " ORDER BY i.id ";

		my $issues = sql(
			"return"	=> "ref",
			"query"		=> $query,
			"values"	=> $params,
		);
	} else {
		die "Permission denied!";
	}
}

=head2 get_issue

This function returns a reference to an array of changes of issue

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item issue_id - id of the issue

=back 

=item Checks

Must have at least read rights

=back

=cut

sub get_issue($$) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $issue_id = shift or die "No finding_id provided";

	if ( may_read($workspace_id) ) {
		my $params = [ $workspace_id, $workspace_id ];

		my $query = "
			SELECT 	ic.id, ic.issue_id, ic.name, ic.ext_ref, ic.description, ic.severity, s.name as serverity_name,
				ic.status, st.name as status_name, ic.user_id, u.username, ic.time as changetime 
			FROM issues i
			LEFT JOIN issue_changes ic ON (i.id = ic.issue_id)
			LEFT JOIN users u ON (ic.user_id = u.id )
			LEFT JOIN issue_status st ON (ic.status = st.id)
			LEFT JOIN severity s ON (ic.severity = s.id)
			WHERE
				i.workspace_id = ? AND
				i.id = ?
			ORDER BY ic.time DESC, ic.id DESC
			";

		return sql( "return"	=> "ref",
			"query"	=> $query,
			"values"	=> [ $workspace_id, $issue_id ]
		);
	} else {
		die "Permission denied!";
	}
}

=head2 issue_finding_link

This function creates or deletes a link between a finding and an issue

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item issue_id - id of the issue

=item finding_id - id of the finding

=item delete (optional) - If true the issue should be deleted

=back 

=item Checks

Must have write rights

=back

=cut
sub issue_finding_link($$$;$) {
	my $workspace_id = shift or die "No workspace_id provided";
	my $issue_id = shift or die "No issue_id provided";
	my $finding_id = shift or die "No finding_id provided";
	my $delete = shift;

	my $query;

	if ( may_write($workspace_id) ) {
		$query = "
			SELECT  count(*) 
			FROM	issues2findings
			WHERE 	issue_id = ? AND finding_id = ?
		";
		my @row = sql( 
			"return"	=> "array",
			"query"		=> $query,
			"values"	=> [ $issue_id, $finding_id ]
		);
		my $count = $row[0];
		if ( $delete ) {
			if ( $count ) { # A previous record exists
				$query = "DELETE FROM issues2findings WHERE issue_id = ? AND finding_id = ?";
				sql(
					"return"	=> "handle",
					"query"		=> $query,
					"values"	=> [ $issue_id, $finding_id ]
				);
				my $user_id = get_user_id($ENV{REMOTE_USER});
				$query = "INSERT INTO issue2finding_changes ( issue_id, finding_id, user_id, deleted ) VALUES ( ?, ?, ?, true )";
				sql(
					"return"	=> "handle",
					"query"		=> $query,
					"values"	=> [ $issue_id, $finding_id, $user_id ]
				);
			}
		} else {
			unless ( $count ) { # A previous record does not exist
				# Check if issues and finding exist in this workspace
				$query = "
					SELECT  count(*) 
					FROM	issues
					WHERE 	id = ? AND workspace_id = ?
				";
				@row = sql( 
					"return"	=> "array",
					"query"		=> $query,
					"values"	=> [ $issue_id, $workspace_id ]
				);
				my $icount = $row[0];
				$query = "
					SELECT 	count(*)
					FROM 	findings
					WHERE   id = ? AND workspace_id = ?
				";
				@row = sql( 
					"return"	=> "array",
					"query"		=> $query,
					"values"	=> [ $finding_id, $workspace_id ]
				);
				my $fcount = $row[0];
				if ( $icount && $fcount ) { # Only if they exist in this workspace
					$query = "INSERT INTO issues2findings ( issue_id, finding_id ) VALUES ( ?, ? )";
					sql(
						"return"	=> "handle",
						"query"		=> $query,
						"values"	=> [ $issue_id, $finding_id ]
					);
					my $user_id = get_user_id($ENV{REMOTE_USER});
					$query = "INSERT INTO issue2finding_changes ( issue_id, finding_id, user_id, deleted ) VALUES ( ?, ?, ?, false )";
					sql(
						"return"	=> "handle",
						"query"		=> $query,
						"values"	=> [ $issue_id, $finding_id, $user_id ]
					);
				}
			}
		}
	} else {
		die "Permission denied!";
	}
}

# Close the PM file.
return 1;
