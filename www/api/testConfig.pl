#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

# Fixes Ticket [ 2981907 ] - Online up2date check
use strict;
use lib "..";
use CGI;
use XML::Simple;

my $query = CGI::new();

print $query->header("text/xml");

# This is where configurations can be found
my @configs = qw(
			config.xml
			/etc/seccubus/config.xml
			/opt/Seccubus/etc/config.xml
	    	);

my @dirs = qw (
		modules
		scanners
		bindir
		configdir
		dbdir
	      );

my $ok = 0;

# Lets see if we have a configuration first

my $config_found = 0;
my $config_file = "";
foreach my $config ( @configs ) {
	if ( -e $config ) {
		$config_found = 1;
		$config_file = $config;
	}
}

report_status(0, "Configuration file could not be found. Please copy one of the example configuration files to config.xml and edit it") unless $config_found;

use SeccubusV2;
my $config = get_config();

# Checking paths
foreach my $dir ( @dirs ) {
	if ( ! -d $config->{paths}->{$dir} ) {
		report_status(1, "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file' does not exist");
	}
}

use SeccubusDB;
my $dbh = open_database;

if ( ! $dbh ) {
	report_status(3, "Unable to log into the the database. Either the definitions in '$config_file' are incorrect or you need to create '$config->{database}->{engine}' database '$config->{database}->{database}' on host '$config->{database}->{host}' and grant user '$config->{database}->{user}' the rights to login in with the specified password and use the database");
}

$ok = 1;
report_status(99999, "Everything is OK!");

exit;

sub report_status($$;) {
	my $state = shift;
	my $error = shift;

	print "<config>\n";
	if ( $ok ) {
		print "<status>OK</status>\n";
	} else {
		print "<status>ERROR</status>\n";
	}
	print "<status_msg>$error</status_msg>\n";

	if ( $state < 1 ) {
		print "<item><label>Config file</label><status>NOK</status><message>$error</message></item>\n";
	} else {
		print "<item><label>Config file</label><status>OK</status><message>Configuration file found at '$config_file'</message></item>\n";
	}

	if ( $state <2 ) {
		print "<item><label>Paths</item><status>NOK</status><message>$error</message></item>\n";
	} else {
		print "<item><label>Paths</item><status>OK</status><message>All paths in the configuraiton file point to existing directories</message></item>\n";
	}

	if ( $state < 3 ) {
		print "<item><label>DB login</label><status>NOK</status><message>$error</message></item>\n";
	} else {
		print "<item><label>DB login</label><status>OK</status><message>We could login to database '$config->{database}->{database}' on host '$config->{database}->{host}' with the credentials from '$config_file'</message></item>\n";
	}

	print "</config>\n";
	exit;
}
