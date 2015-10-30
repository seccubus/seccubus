# ------------------------------------------------------------------------------
# Copyright 2014 Frank Breedijk, Petr
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

package SeccubusDB;

=head1 NAME $RCSfile: SeccubusDB.pm,v $

This Pod documentation generated from the module SeccubusDB gives a list of all 
functions within the module.

=cut

use Exporter;
use DBI;

#use SeccubusConfig;

@ISA = ('Exporter');

@EXPORT = qw ( 
		open_database
		sql
	);

use strict;
use Carp;

sub open_database();
sub sql(@);

my (
	$dbh,
        $db_engine
   );

###############################################################################
# Database helper functions
###############################################################################

=head1 Database helper functions

=head2 open_database

This function opens the database specified in config.xml and assigns the
dbh to the $dbh variable unless the database is allready open

=over 2

=item Parameters

=over 4

=item none

=back

=item Returns

None, but sets global variable $dbh

=item Checks

Global variable $dbh to see it the database is allready open.

=back

=cut

sub open_database() {
	my $dsn;

	# This routine uses DBI->connect_cached to efficiently and safely use 
	# a single DB connection in stead on multiple

	my $config = SeccubusV2::get_config();
	if ( $config->{database}->{engine} eq "mysql" ) {
		$dsn = "DBI:" . $config->{database}->{engine} 
			. ":database=" . $config->{database}->{database} 
			. ";host=" . $config->{database}->{host} 
			. ";port=" . $config->{database}->{port};
		$db_engine = "mysql";
	} elsif ( $config->{database}->{engine} eq "SQLite" ) {
		$dsn = "DBI:SQLite:dbname=$config->{database}->{database}";
		$db_engine = "SQLite";
	} elsif ( $config->{database}->{engine} eq "Pg" ) {
	        $dsn = "DBI:Pg:dbname=$config->{database}->{database}";
		$db_engine = "Pg";
	} else {
		die "Database engine  $config->{database}->{engine} is currently not supported";
	}
	$dbh = DBI->connect_cached($dsn, $config->{database}->{user}, $config->{database}->{password});
	return ($db_engine,$dbh);
}

=head2 sql

This is a wrapper function to execute SQL. This function add an abstrction to 
the perl DBI calls so that support for multiple databases can be added more
easily later

=over 2

=item Parameters (named parameters via hash)

=over 4

=item return - determimes what value is returned by the funtion:

ref - returns the result of fetchall_arrayref (default)

id - return the inserted id

handle - return the reference to the statement handler

array - returns the result of fetchrow_array

rows - number of rows effected by last update statement

=item query - the SQL query (mandatory)

=item values - Arrayref to the values that need to be bound after the prepare statement

=back

=item Returns

The return value is determined by the return parameter

=item Checks

If statement prepares and executes well

=back

=cut

sub sql(@) {
	my %arg = @_;
	$arg{return} = "ref" unless $arg{return};

	confess "No query parameter specified" unless exists $arg{query};

	($db_engine,$dbh) = open_database();

	if ( $db_engine eq "Pg") {
	    # PostGres hates backticks.
	    $arg{query} =~ s/\`//g;
	    
	    if( $arg{return} eq "id" ){
		# PostGres wants you to specify to return the id
		# There may be more places where queries need to have their return
		# type changes from 'id' to 'none' (see below).
		if($arg{query} =~ /;\s*$/){
		    $arg{query} =~ s/;/ RETURNING id;/;
		}else{
		    $arg{query} .= " RETURNING id";
		}
	    }
	}
	confess("Unable to open database") unless $dbh;
	my $sth = $dbh->prepare($arg{query}) or
		confess "Problem with preparing sql statement $arg{query}\n" . $dbh->errstr; 
	if ( exists $arg{values} ) {
		my $count = 1;
		foreach my $param ( @{$arg{values}} ) {
			$sth->bind_param( $count++, $param) or
				confess "Unable to bind prameter $count ($param) to query $arg{query}\n" . $sth->errstr;
		}
	}
	$sth->execute() or
		confess "Problem with execution of sql statement $arg{query}\n" . $sth->errstr;
	if ( $arg{return} eq "id" ) {		# We need to return the inserted
	                                        # ID
	    if( $db_engine eq "mysql") {
		return $sth->{mysql_insertid};  # This is MySQL specific
	    }elsif ( $db_engine eq "Pg") {
		# something here is throwing a DBI warning, but it works.
		# it might also be the default fetchall down below.
		# I've add a return option of "none", but only changed it in a couple
		# locations
		my $insert_id = $sth->fetchall_arrayref();
		return ${$insert_id}[0][0];
	    }else{
		## Something for SQLite?
	    }

	} elsif ($arg{return} eq "rows") {	# Return the number of rows changed by the last command
		return $sth->rows();	
	} elsif ( $arg{return} eq "handle" ) {
		return $sth;
	} elsif ( $arg{return} eq "array" ) {
		return $sth->fetchrow_array();
	} elsif ( $arg{return} eq 'arrayref') {
		return $sth->fetchall_arrayref({});
	} elsif ( $arg{return} eq "none") {
	        return $sth->finish;
	} else {
		return $sth->fetchall_arrayref();
	}
}

# Close the PM file.
return 1;
