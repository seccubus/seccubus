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
use HTML::Entities;

my $current_db_version = 1;
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

require SeccubusV2;
my $config = SeccubusV2::get_config();

# Checking paths
foreach my $dir ( @dirs ) {
	if ( ! -d $config->{paths}->{$dir} ) {
		report_status(1, "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file' does not exist");
	}
}

require SeccubusDB;
my $dbh = SeccubusDB::open_database();

if ( ! $dbh ) {
	report_status(2, "Unable to log into the the database. Either the definitions in '$config_file' are incorrect or you need to create '$config->{database}->{engine}' database '$config->{database}->{database}' on host '$config->{database}->{host}' and grant user '$config->{database}->{user}' the rights to login in with the specified password and use the database");
}

my $tables = SeccubusDB::sql( return	=> "ref",
		  	      query	=> "show tables",
			    );

if ( ! @$tables ) {
	my $file = $config->{paths}->{dbdir} . "/structure_v$current_db_version" . "\." . $config->{database}->{engine};
	my $msg = "Your database seems to be empty, please execute the sql statements in '$file' to create the required tables";
	my $api = "api/updateDB.pl?toVersion=$current_db_version&action=structure";
	report_status(5, $msg, $api);
}

my @version = SeccubusDB::sql( return	=> "array",
		   	       query	=> "SELECT value FROM config 
			                    WHERE name = ?",
		   	       values	=> [ "version" ],
		 	     );

if ( ! @version ) {
	my $file = $config->{paths}->{dbdir} . "/data_v$current_db_version" . "\." . $config->{database}->{engine};
	my $msg = "Your database does not contain any base data, please execute the sql statements in '$file' to insert the base data into the database";
	my $api = "api/updateDB.pl?toVersion=$current_db_version&action=data";
	report_status(4, $msg, $api);
} elsif ( $version[0] != $current_db_version ) {
	my $msg = "Your database currently has a version number that isn't that of the current database version. Since this cannot happen at this time, you are on your own";
	report_status(5, $msg);
}

$ok = 1;
report_status(99999, "Everything is OK!");

exit;

sub report_status($$;$) {
	my $state = shift;
	my $error = shift;
	my $api = shift;

	$error = encode_entities($error);
	$api = encode_entities($api);
	print "<seccubusAPI name='testConfig.pl'>\n";
	if ( $ok ) {
		print "<result>OK</result>\n";
	} else {
		print "<result>NOK</result>\n";
	}
	print "<message>$error</message>\n";
	print "<data>\n";

	if( $state == 0 ) {
		print "<item><label>Config file</label><status>NOK</status><message>$error</message></item>\n";
	} elsif ( $state > 0 ) {
		print "<item><label>Config file</label><status>OK</status><message>Configuration file found at '$config_file'</message></item>\n";
	}

	if ( $state == 1 ) {
		print "<item><label>Paths</label><status>NOK</status><message>$error</message></item>\n";
	} elsif ( $state > 1 ) {
		print "<item><label>Paths</label><status>OK</status><message>All paths in the configuraiton file point to existing directories</message></item>\n";
	}

	if ( $state == 2 ) {
		print "<item><label>DB login</label><status>NOK</status><message>$error</message></item>\n";
	} elsif ( $state > 2 ) {
		print "<item><label>DB login</label><status>OK</status><message>We could login to database '$config->{database}->{database}' on host '$config->{database}->{host}' with the credentials from '$config_file'</message></item>\n";
	}

	if ( $state == 3 ) {
		print "<item><label>DB tables</label><status>NOK</status><message>$error</message><api>$api</api></item>\n";
	} elsif ( $state > 3 ) {
		print "<item><label>DB tables</label><status>OK</status><message>Your database does have datastructures in it.</message></item>\n";
	}

	if ( $state == 4 ) {
		print "<item><label>DB basedata</label><status>NOK</status><message>$error</message><api>$api</api></item>\n";
	} elsif ( $state > 4 ) {
		print "<item><label>DB basedata</label><status>OK</status><message>Your database does have basic data in it.</message></item>\n";
	}

	if ( $state == 5 ) {
		print "<item><label>DB version</label><status>NOK</status><message>$error</message><api>$api</api></item>\n";
	} elsif ( $state > 5 ) {
		print "<item><label>DB version</label><status>OK</status><message>Your database has the latest version.</message></item>\n";
	}

	print "</data>\n";
	print "</seccubusAPI>\n";
	exit;
}
