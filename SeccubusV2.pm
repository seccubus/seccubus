# ------------------------------------------------------------------------------
# Copyright 2017 Frank Breedijk, Glenn ten Cate
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
package SeccubusV2;

=head1 NAME $RCSfile: SeccubusV2.pm,v $

This Pod documentation generated from the module SeccubusV2 gives a list of all
functions within the module.

=cut

@ISA = ('Exporter');

@EXPORT = qw(
		VERSION
		DBVERSION
		get_config
		check_param
	    );

use XML::Simple;
use Data::Dumper;

our $config = "config.xml";		# Change this value to match your setup
					# if your configuration file cannot be
					# found
$config = "/home/seccubus/etc/config.xml" unless -e $config;
					# Bug #62 - /home/seccubus/etc missing
$config = "/etc/seccubus/config.xml" unless -e $config;

$config = "/opt/seccubus/etc/config.xml" unless -e $config;

# This line should prevent issue 21 dummy.config.xml should never exist
$config = "etc/dummy.config.xml" unless -e $config;

# Module directory
use lib "/opt/seccubus/lib";
use lib "lib";
push (@main::INC, @INC);

$VERSION = '2.35';
$DBVERSION = 10;
$USER = '';

use strict;
use Carp;
#use SeccubusConfig;
use Seccubus::Helpers;
use Seccubus::Users;

if ( ! $ENV{SECCUBUS_USER} && ! exists $ENV{MOJO_MODE} && ! exists $ENV{MOJO_HOME} ) {
	$ENV{SECCUBUS_USER} = "admin"		# Run as admin user if we are not running via mojo
}

=head1 Utility functions

=head2 get_config

=over 2

=item Parameters

=over 4

=item file  - File to read configuration from

=back

=item Returns

Reference to a hash containing the config in XML

=back

=cut

sub get_config(;$) {
	my $cfg = shift;

	if ( $cfg ) {
		confess("Configuration file '$cfg' does not exist") if ( ! -e $cfg );
		$config = $cfg;
	}
	if ( ! ref($config) ) {
		$config = XMLin($config, ForceArray => [qw(monkey)], KeyAttr => [ qw(id) ], SuppressEmpty => '');
	}
	return $config;
}

=head2 check_param

Function to check CGI parameters

=over 2

=item Parameters

=over 4

=item name - name of the parameter

=item value - value of the parameter

=item is_numeric - Optional parameter, if set the function checks if the parameter is numeric

=item Returns

False if parameter is ok, error text if otherwise

=back

=cut

sub check_param($$;$) {
	my $name = shift or die "No name provided";
	my $value = shift;
	my $is_numeric = shift;

	if ( not defined $value ) {
		return "Parameter $name is missing";
	} elsif ( $is_numeric ) {
		if ( $value + 0 eq $value ) {
			return undef;
		} else {
			return "Parameter $name is not numeric";
		}
	}
}

# Close the PM file.
return 1;

