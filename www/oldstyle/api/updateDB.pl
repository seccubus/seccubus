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

use SeccubusV2;
use SeccubusDB;
use SeccubusHelpers;

my $query = CGI::new();

print $query->header("text/xml");

my $action = $query->param("action");
my $from_version = $query->param("fromVersion");
my $to_version = $query->param("toVersion");

my $config = get_config();
my $db_type = $config->{database}->{engine};

if ( $db_type ne "mysql" ) {
	api_error("updateDB", "Database type '$db_type' is no supported by the API");
}
if ( $to_version ne $to_version+1-1 || ! $to_version ) {
	api_error("updateDB", "toVersion '$to_version' is not numeric or missing");
}

my $file = $config->{paths}->{dbdir} . "/";
if ( $action eq "data" ) {
	$file .= "data_v$to_version.$db_type";
} elsif ( $action eq "structure" ) {
	$file .= "structure_v$to_version.$db_type";
} elsif ( $action eq "upgrade" ) {
	if ( $from_version ne $from_version+1-2 || ! $from_version ) {
	        api_error("updateDB", "fromVersion '$from_version' is not numeric or missing");
	}
	$file .= "update_v$from_version-v$to_version.$db_type";
} else {
	api_error("updateDB", "Action '$action' is not supported by the API");
}

if ( ! -e $file ) {
	api_error("updateDB", "File '$file' does not exist");
}

open(FILE, $file) or api_error("updateDB", "Unable to open file '$file'");
my $sql = join "", <FILE>;
close FILE;

$/ = ''; # multiline re
while ( $sql ) {
	if ( $sql =~ m/^(\s*\-\-.*?)\n(.*)/s ) {		# Strip comment
		$sql = $2;
	} elsif ( $sql =~ m/^(\s*.*?)\;(.*)/s ) {
		$sql = $2;
		if ( $1 ) {
			$query = $1;
			eval {
				sql( return	=> "handle",
			     	     query	=> $query );
			} or do {
				api_error("updateDB", $@);
			}
		}
	} elsif ( $sql =~ m/^\s*$/s ) {
		$sql = "";
	} else {
		api_error("updateDB", "Cannot parse SQL: $sql");
	}
}

api_result("updateDB", "The sql statements in '$file' was executed succesfully executed");

exit;

