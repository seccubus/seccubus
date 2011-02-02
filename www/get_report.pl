#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: get_report.pl,v 1.5 2010/07/05 12:17:04 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# Upload a report directy to the user
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use SeccubusWeb;

my $VAR  = get_var;
my $query = CGI::new();
my $scan = $query->param("scan") or die "Cannot get scan";
my $date = $query->param("date") or die "Cannot get scan";
my $type = $query->param("type") or die "Cannot get scan";

# Ticket [ 2916290 ] - Directory traversal vulnerability in get_report.pl
check_param($query->param("scan")) if $query->param("scan");
check_param($query->param("type")) if $query->param("type");
check_date($query->param("date")) if $query->param("date");

check_permission($scan);

if ( $type eq "html" ) {
	print $query->header();
} elsif ( $type eq "xml" ) {
	print $query->header("text/xml");
} elsif ( $type eq "nbe" || $type eq "rpt" ) {
	print $query->header("text/plain");
} else {
	# Ticket [ 2916290 ] - Directory traversal vulnerability in 
	# get_report.pl
	die "Invalid report type";
}

open (RPT, "$VAR/$scan/output/$date.$type") or die "Unable to open $VAR/$scan/output/$date.$type";

print <RPT>;

close RPT;

