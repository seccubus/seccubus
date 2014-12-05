# ------------------------------------------------------------------------------
# Copyright 2014 Arkenoi, Frank Breedijk
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

package SeccubusCustomSQL;

=head1 NAME $RCSfile: SeccubusCustomSQL.pm,v $

This Pod documentation generated from the module SeccubusCustomSQL gives a 
list of all functions within the module.

=cut


use Exporter;

@ISA = ('Exporter');

@EXPORT = qw ( 
		get_customsql
		get_savedsql
		set_customsql
	);

use SeccubusDB;
use SeccubusRights;

sub get_customsql($);
sub get_savedsql();
sub set_customsql($$;);

=head2 get_customsql

This function executes custom sql

=over 2

=item Parameters

=over 4

=item sql - custom sql

=back 

=back

=item Checks

User must be admin to execute custom SQL. 

=back

=cut

sub get_customsql($){
	my $sql = shift or confess "no sql provided";
	confess "Permission denied" unless is_admin();
	return sql ( 
		"return"	=> "arrayref",
		"query" 	=> $sql
	);
}


=head2 get_savedsql

This function returns all saved sqls

=back 

=item Checks

User must be admin to execute custom SQL. 

=back

=cut

sub get_savedsql() {
	confess "Permission denied" unless is_admin();
	return sql ( 
		"return"	=> "arrayref",
		"query"		=> "SELECT * FROM `customsql` ORDER BY id"
		);
}

=head2 set_customsql

This function saves custom sql

=over 2

=item Parameters

=over 4

=item name - name for custom sql

=item sql - custom sql

=back 

=back

=item Checks

User must be admin to execute custom SQL. 

=back

=cut

sub set_customsql($$;) {
	my $name = shift or confess "no name provided";
	my $sql = shift or confess "no sql provided";
	confess "Permission denied" unless is_admin();
	my $id = sql ( 
		"return"	=> "id",
		"query" 	=> "insert into `customsql` set name=?, `sql`=?",
		"values" 	=> [$name,$sql]
	);
	return [$id];
}

1;