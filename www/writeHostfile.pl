#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: writeHostfile.pl,v 1.4 2010/07/05 12:17:04 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# This page writes the host file to disk
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use SeccubusWeb;

my $VAR = get_var;
my $query = CGI::new();
my $scan = $query->param("scan") or die "Cannot get scan";
my $hostfile = $query->param("hostfile") or die "Cannot get hostfile";

print_header();

print "<h1>Writing $scan hostfile</h1>";

if ( $hostfile !~ /[\<\>]/ ) {
	open( HOSTFILE, ">$VAR/$scan/hostnames" ) 
		or die "Unable to write status file $VAR/$scan/hostnames";
	print HOSTFILE $hostfile;
	close HOSTFILE;
	print "Hostfile changed to: <PRE>$hostfile</PRE>";
} else {
	print "Don't try to hack me please...";
}
print "<blink>Done...</blink>\n";

print_footer();
