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
use JSON;

sub result($$$$);
sub bye($);

my $current_db_version = 1;
my $query = CGI::new();
my $json = JSON->new();

print $query->header("application/json");

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
my $data = [];


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
	result($data,"Configuration file", "Configuration file found at '$config_file'", 'OK');
} else {
	result($data,"Configuration file", "Configuration file could not be found. Please copy one of the example configuration files to config.xml and edit it", "Error");
	bye($data);
}

require SeccubusV2;
my $config = SeccubusV2::get_config();

##### Test paths
foreach my $dir ( @dirs ) {
	if ( ! -d $config->{paths}->{$dir} ) {
		result($data, "Path $dir", "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file', does not exist", "Error");
		bye($data);
	} else {
		result($data, "Path $dir", "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file', was found", "OK");
	}
}

##### Test database login
require SeccubusDB;
my $dbh = SeccubusDB::open_database();

if ( ! $dbh ) {
	result($data, "Datatbase login", "Unable to log into the the database. Either the definitions in '$config_file' are incorrect or you need to create '$config->{database}->{engine}' database '$config->{database}->{database}' on host '$config->{database}->{host}' and grant user '$config->{database}->{user}' the rights to login in with the specified password and use the database", "Error");
	bye($data);
} else {
	result($data, "Database login", "Login to database '$config->{database}->{database}' on host '$config->{database}->{host}' with the credentials from '$config_file', was successful", "OK");
}

##### Test database tables
# Make sure login to the database was successful
my $tables = SeccubusDB::sql( return	=> "ref",
		  	      query	=> "show tables",
			    );

if ( ! @$tables ) {
	my $file = $config->{paths}->{dbdir} . "/structure_v$current_db_version" . "\." . $config->{database}->{engine};
	result($data, "Database structure", "Your database seems to be empty, please execute the sql statements in '$file' to create the required tables", "Error");
	bye($data);
	# TODO: Add link to screen that does this for the user
	# my $api = "api/updateDB.pl?toVersion=$current_db_version&action=structure";
} else {
	result($data, "Database strcture", "Your database does have datastructures in it.", 'OK');
}

##### Test the default DB data version
eval {
	local $SIG{__DIE__}; # No sigdie handler

	my @version = SeccubusDB::sql( return	=> "array",
		   	       query	=> "SELECT value FROM config 
			                    WHERE name = ?",
	   	    	   values	=> [ "version" ],
	 	     	);

	if ( $version[0] != $current_db_version ) {
		result($data,"Database version", "Your database currently has a version number that isn't that of the current database version. Since this cannot happen at this time, you are on your own", 'Error');
		bye($data);
	} else {
		result($data,"Database version", "Your database has the base data and is the current version.", 'OK');
	}		 	     
} or do {
	my $file = $config->{paths}->{dbdir} . "/data_v$current_db_version" . "\." . $config->{database}->{engine};
	result($data, "Database data", "Your database is missing data, please execute the sql statements in '$file' to insert the base data into the database", 'OK');
	bye($data);
	# TODO: Direct user to a helpfull screen
	# my $api = "api/updateDB.pl?toVersion=&action=data";
	# $message = "$msg. API Call: '$api'";
};
bye($data);
exit;

sub result($$$$) {
	my $data = shift;
	my $name = shift;
	my $message = shift;
	my $result = shift;

	push @{$data}, { 
		'name' 		=> $name,
		'message' 	=> $message,
		'result'	=> $result,
	};
}

sub bye($) {
	my $data = shift;

	print $json->pretty->encode($data);
	exit;
}
