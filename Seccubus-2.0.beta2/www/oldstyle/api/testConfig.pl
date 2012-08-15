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

my $ok = 1;
my $status = "";
my $message = "";

print "<seccubusAPI name='testConfig.pl'>\n";
print "<data>\n";
	
##### Test configuration first
print "<item><label>Config file</label>";

my $config_found = 0;
my $config_file = "";
foreach my $config ( @configs ) {
	if ( -e $config ) {
		$config_found = 1;
		$config_file = $config;
	}
}
#report_status(0, "Configuration file could not be found. Please copy one of the example configuration files to config.xml and edit it") unless $config_found;
if( $config_found) {
	$status = "OK";
	$message = "Configuration file found at '$config_file'";
} else {
	$status = "NOK";
	$message = "Configuration file could not be found. Please copy one of the example configuration files to config.xml and edit it";
	$ok = 0;
}
$message = encode_entities($message);
print "<status>$status</status><message>$message</message></item>\n";

require SeccubusV2;
my $config = SeccubusV2::get_config();

##### Test paths
foreach my $dir ( @dirs ) {
	print "<item><label>Paths</label>";
	if ( ! -d $config->{paths}->{$dir} ) {
		$status = "NOK";
		$message = "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file', does not exist";
		$ok = 0;
		#report_status(1, "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file' does not exist");
	} else {
		$status = "OK";
		$message = "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file', was found";
	}
	$message = encode_entities($message);
	print "<status>$status</status><message>$message</message></item>\n";
}

##### Test database login
my $testDBLogin;
print "<item><label>DB login</label>";
require SeccubusDB;
my $dbh = SeccubusDB::open_database();

if ( ! $dbh ) {
	$status = "NOK";
	$message = "Unable to log into the the database. Either the definitions in '$config_file' are incorrect or you need to create '$config->{database}->{engine}' database '$config->{database}->{database}' on host '$config->{database}->{host}' and grant user '$config->{database}->{user}' the rights to login in with the specified password and use the database";
	$ok = 0;
	$testDBLogin = 0;
	#report_status(2, "Unable to log into the the database. Either the definitions in '$config_file' are incorrect or you need to create '$config->{database}->{engine}' database '$config->{database}->{database}' on host '$config->{database}->{host}' and grant user '$config->{database}->{user}' the rights to login in with the specified password and use the database");
} else {
	$status = "OK";
	$message = "Login to database '$config->{database}->{database}' on host '$config->{database}->{host}' with the credentials from '$config_file', was successful";
	$testDBLogin = 1;
}
$message = encode_entities($message);
print "<status>$status</status><message>$message</message></item>\n";

##### Test database tables
# Make sure login to the database was successful
if ($testDBLogin) {	
	print "<item><label>DB tables</label>";
	my $tables = SeccubusDB::sql( return	=> "ref",
			  	      query	=> "show tables",
				    );

	if ( ! @$tables ) {
		my $file = $config->{paths}->{dbdir} . "/structure_v$current_db_version" . "\." . $config->{database}->{engine};
		my $msg = "Your database seems to be empty, please execute the sql statements in '$file' to create the required tables";
		my $api = "api/updateDB.pl?toVersion=$current_db_version&action=structure";
		$status = "NOK";
		$message = "$msg. API Call: '$api'";
		$ok = 0;
		#report_status(5, $msg, $api);
	} else {
		$status = "OK";
		$message = "Your database does have datastructures in it.";
	}
	$message = encode_entities($message);
	print "<status>$status</status><message>$message</message></item>\n";
}

##### Test the default DB data version
# Make sure login to the database was successful
if ($testDBLogin) {		
	print "<item><label>DB data version</label>";
	eval {
		local $SIG{__DIE__}; # No sigdie handler
	
		my @version = SeccubusDB::sql( return	=> "array",
			   	       query	=> "SELECT value FROM config 
				                    WHERE name = ?",
		   	    	   values	=> [ "version" ],
		 	     	);

		if ( $version[0] != $current_db_version ) {
			$status = "NOK";
			$message = "Your database currently has a version number that isn't that of the current database version. Since this cannot happen at this time, you are on your own";
			$ok = 0;
			#report_status(5, $msg);
		} else {
			$status = "OK";
			$message = "Your database has the base data and is the current version.";
		}		 	     
	} or do {
		my $file = $config->{paths}->{dbdir} . "/data_v$current_db_version" . "\." . $config->{database}->{engine};
		my $msg = "Your database is missing data, please execute the sql statements in '$file' to insert the base data into the database";
		my $api = "api/updateDB.pl?toVersion=&action=data";
		$status = "NOK";
		$message = "$msg. API Call: '$api'";
		$ok = 0;
	};
	$message = encode_entities($message);
	print "<status>$status</status><message>$message</message></item>\n";
}

##### Overall status of tests
my $result = "";

if ($ok) {
	$result = "OK";
	$message = "Configuration is OK!";
} else {
	$result = "NOK";
	$message = "Test(s) for a valid configuration failed!";
}

#report_status(99999, "Configuration is OK!");

print "</data>\n";
print "<result>$result</result>\n";
print "<message>$message</message>\n";
print "</seccubusAPI>\n";

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
