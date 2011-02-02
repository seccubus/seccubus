#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use SeccubusWeb;

my (
	$count,
	$total,
	$VAR,
   );

my $query = CGI::new();
$VAR  = get_var();
my @scans = <$VAR/*>;

print $query->header("text/plain");

foreach my $scan ( @scans ) {
	$scan =~ s/.*\/(.*?)$/$1/;
	# if ( check_permission($scan, 1) ) {
	# BUG [ 2130354 ] Remove CVS from scans list
	if ( $scan ne "CVS" && check_permission($scan, 1) ) {
		print "<p><a href='#' onClick='newScan(\"$scan\")'>$scan</a>\n";
		$count++;
	}
	$total++;
}
print "<p><small>$count of $total available scans for $ENV{REMOTE_USER} shown</small></p>";
#print "<p><small>$ENV{SERVER_ADDR}</small></p>";
# Removed as per BUG [ 1914354 ] get_scans.pl still displays IP address
print "<p><small>This is Seccubus v $SeccubusWeb::VERSION</small></p>\n";
