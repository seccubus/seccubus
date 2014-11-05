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

=cut

sub get_customsql($){
	my $sql = shift or die "no sql procided";
	return sql ( "return" => "arrayref",
		"query" => $sql
		);
}


=head2 get_savedsql

This function returns all saved sqls

=back 

=back

=cut

sub get_savedsql() {
	return sql ( "return" => "arrayref",
		"query" => "select * from `customsql` order by id"
		);
}

=head2 get_savedsql

This function saves custom sql

=over 2

=item Parameters

=over 4

=item name - name for custom sql

=item sql - custom sql

=back 

=back

=cut

sub set_customsql($$;) {
	my $name = shift or die "no name provided";
	my $sql = shift or die "no sql provided";
	my $id = sql ( "return" => "id",
		"query" => "insert into `customsql` set name=?, `sql`=?",
		"values" => [$name,$sql]
		);
	return [$id];
}

1;