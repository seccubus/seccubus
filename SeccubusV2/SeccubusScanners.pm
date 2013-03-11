# ------------------------------------------------------------------------------
# Copyright 2013 Frank Breedijk
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
package SeccubusScanners;

=head1 NAME $RCSfile: SeccubusScanners.pm,v $

This Pod documentation generated from the module SeccubusScanners gives a
list of all functions within the module.

=cut

use Exporter;

@ISA = ('Exporter');

@EXPORT = qw ( 
		get_scanners
	);


use strict;
use Carp;

sub get_scanners(;);

=head2 get_scanners

Returns a reference to a list of workspaces the user has installed on their 
system:
(name, description, help)

=over 2

=item Parameters

=over 4

None

=back

=item Checks

None

=back

=cut

sub get_scanners(;) {
	my $config = SeccubusV2::get_config();

	my @result = ();

	my $path = $config->{paths}->{scanners};

	my @scanners =  glob $path . "/*";

	foreach my $scanpath (sort @scanners) {
		$scanpath =~ /^.*\/(.*?)$/;
		my $scanner = $1;
		my @data = ( $scanner ) ;
		if ( -e "$scanpath/description.txt" ) {
			open(DESC, "$scanpath/description.txt") or die "Unable to open $scanpath/description.txt";
			push @data, (join "", <DESC>);
			close DESC;
		} else {
			push @data, "No description available";
		}
		if ( -e "$scanpath/help.html" ) {
			open(HELP, "$scanpath/help.html") or die "Unable to open $scanpath/help.html";
			push @data, (join "", <HELP>);
			close HELP;
		} else {
			push @data, "No help available";
		}
		if ( -e "$scanpath/defaults.txt" ) {
			open(PARAM, "$scanpath/defaults.txt") or die "Unable to open $scanpath/defaults.txt";
			push @data, (join "", <PARAM>);
			close PARAM;
		} else {
			push @data, "No default parameters available";
		}
		push @result, \@data;
	}
	return \@result;
}

# Close the PM file.
return 1;
