#!/usr/bin/env perl
# Copyright 2015 Frank Breedijk, Petr, Andreas Thienemann
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
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------

# Fixes Ticket [ 2981907 ] - Online up2date check
use strict;
use lib "..";
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;

sub result($$$$);
sub bye($);

my $current_db_version = 7;
my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate", -"X-Clacks-Overhead" => "GNU Terry Pratchett");

# This is where configurations can be found
# Ticket #62 - Default locations for config.xml does not include 
# /home/seccubus/etc/config.xml
my @configs = qw(
			/home/seccubus/etc/config.xml
			/etc/seccubus/config.xml
			/opt/seccubus/etc/config.xml
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
	result($data,"Configuration file", "Configuration file could not be found. Please copy one of the example configuration files to one of the following locations and edit it:" . join(", ",@configs), "Error");
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
	result($data, "Database login", "Unable to log into the the database. Either the definitions in '$config_file' are incorrect or you need to create '$config->{database}->{engine}' database '$config->{database}->{database}' on host '$config->{database}->{host}' and grant user '$config->{database}->{user}' the rights to login in with the specified password and use the database", "Error");
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
	result($data, "Database structure", "Your database does have datastructures in it.", 'OK');
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
		my $file = $config->{paths}->{dbdir} . "/";
		if ( $version[0] eq "" ) {
			$file .= "data_v$current_db_version." . $config->{database}->{engine};
		} elsif ( $version[0] < $current_db_version ) {
			$file .= "upgrade_v$version[0]_v" . ($version[0]+1) . "." . $config->{database}->{engine};
		} else {
			result($data,"Database error", "Your database returned version number '$version[0]', the developers for Seccubus do not know what to do with this", "Error");
			bye($data);
		}
		result($data,"Database version", "Your database is not current, please execute the sql statements in '$file' to update the database to the next version and rerun this test", 'Error');
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

##### Test if the user exists in the database
if ( exists $ENV{REMOTE_ADDR} ) {
	if ( $ENV{REMOTE_USER} ) {
		my @user = SeccubusDB::sql( return   => "array",
					    query	=> 'SELECT 	username
					    		    FROM	users
							    WHERE	username = ?',
					    values	=> [ $ENV{REMOTE_USER} ],
			   );
		if ( $user[0] eq $ENV{REMOTE_USER} ) {
			result($data, "HTTP authentication", "Authentication is set up on your HTTP server, and user '$ENV{REMOTE_USER}' exists in the database", 'OK');
		} else {
			result($data, "HTTP authentication", "Authentication is set up on your HTTP server, but '$ENV{REMOTE_USER}' does not exist in the database, run the bin/add_user util", 'Error');
			bye($data);
		}
	} else {
		result($data, "HTTP authentication", "Authentication is not set up on your HTTP server, emulating user 'admin'", 'OK');
	}
}

##### Test SMTP config
if ( ! exists $config->{smtp} ) {
	result($data, "SMTP configuration", "No smtp configuration specified in you config file, notification will NOT be sent", 'Warn');
} elsif(  ! exists $config->{smtp}->{server} ) {
	result($data, "SMTP configuration", "No smtp server specified", "Error");
} elsif( ! gethostbyname($config->{smtp}->{server}) ) {
	result($data, "SMTP configuration", "Cannot resolve smtp server $config->{smtp}->{server}", "Error");
} elsif( ! exists $config->{smtp}->{from} ) {
	result($data, "SMTP configuration", "No from address specified", "Error");
} elsif ( $config->{smtp}->{from} !~ /^[\w\.\+]+\@[\w\d\.]+$/ ) {
	result($data, "SMTP configuration", "$config->{smtp}->{from} doesn't apear to be a valid email address", "Error");
} else {
	result($data, "SMTP configuration", "SMTP configuration OK", "OK");
}

##### return results and exit
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
