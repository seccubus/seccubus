#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Update multiple items in one go
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------
use strict;
use CGI;
use SeccubusWeb;

my (
	$host,
	$port,
	$plugin,
	$finding,
   );

my $VAR  = get_var;
my $query = CGI::new();
my $scan = $query->param("scan") or die "Cannot get scan";
my $status = $query->param("status");
my $remark = $query->param("remark");
my $overwrite = $query->param("overwrite");
my @findings = $query->param("finding") or die "Cannot get finding";

print_header();

print "<h1>Bulkupdate $scan</h1>\n"; 

check_param($remark);
if ( $status ) {
	print "<h2>Changing status</h2>\n";
	if ( check_status($status) ) {
		foreach $finding ( @findings ) {
			if ( $finding ne "dummy" ) {
				($host, $port, $plugin) = split /\//, $finding;
				check_param($host);
				check_param($port);
				check_param($plugin);
				open( STATUS, ">$VAR/$scan/findings/$host/$port/$plugin/status" ) 
					or die "Unable to write status file $VAR/$scan/findings/$host/$port/$plugin/status";
				print STATUS $status;
				close STATUS;
				print "Status changed to $status for host $host port $port plugin $plugin<br>";
			}
		}
	} else {
		print "Don't try to hack me please...";
	}
} 
if ( $remark ) {
	if ( $overwrite ) {
		print "<h2>Changing remark</h2>\n";
		print "Changing remark to $remark<br><br>";
	} else {
		print "<h2>Adding to remark</h2>\n";
		print "Adding $remark to remark<br><br>";
	}
	if ( $remark !~ /[\<\>]/ ) {
		foreach $finding ( @findings ) {
			if ( $finding ne "dummy" ) {
				($host, $port, $plugin) = split /\//, $finding;
				check_param($host);
				check_param($port);
				check_param($plugin);
				if ( $overwrite ) {
					open( REMARK, ">$VAR/$scan/findings/$host/$port/$plugin/remark" ) 
						or die "Unable to write remark file $VAR/$scan/findings/$host/$port/$plugin/remark";
				} else {
					open( REMARK, ">>$VAR/$scan/findings/$host/$port/$plugin/remark" ) 
						or die "Unable to write remark file $VAR/$scan/findings/$host/$port/$plugin/remark";
					print REMARK "\n";
				}
				print REMARK $remark;
				close REMARK;
				print "For host $host port $port plugin $plugin ... OK<br>";
			}
		}
	} else {
		print "Don't try to hack me please...";
	}
}

print "<h2>Done</h2>";
print "<a href='#' onClick='window.close();'>Click here to close this window</a>";

print_footer();
