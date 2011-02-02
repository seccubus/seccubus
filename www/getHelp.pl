#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: getHelp.pl,v 1.4 2009/12/17 15:04:30 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use SeccubusWeb;

#my (
   #);

my $query = CGI::new();

print $query->header("text/plain");

my $topic = $query->param("topic") or die "No topic specified";
check_param($topic);

if ( $topic eq "Start" ) {
	print "
		Please start by selecting a scan from the left side of the 
		screen. If no scans are shown you have either not finished the
		setupd (in this case refer to the documentation on 
		<a href='http://www.Seccubus.com'>www.Seccubus.com</a> or 
		you have insuffcient rights to view any scans, in this case 
		contact you administrator
	      ";
} elsif ( $topic eq "ScanInfo" ) {
	print "
		The list below shows an overview of all the times this scan was
		run. The scan output can be downloaded as html, xml or nbe file
		you can also download the output of the run by clicking on the
		changes link
	      ";
} elsif ( $topic eq "HostFile" ) {
	print "
		This input box works like the /etc/hosts file on a unix box. 
		Each line contains an IP adress and a hostname separated by 
		whitespace. This is used to link IP addresses to names in the 
		scan output.
	      ";
} elsif ( $topic eq "NEW" ) {
	print "
		Findings (the combinatiuon pluginID, port, host) get the status
		NEW in one of the following conditions:
		<ul>
			<li>This findings is found for the first time 
			<li>The finding was previously marked as GONE or FIXED 
				but was found again
		</ul>
		It is suggested that you give findings one of following 
		statusses:
		<ul>
			<li> OPEN - This is a real security issue
			<li> NO ISSUE - This finding does not represent a 
				security issue
			<li> HARD MASKED - Ignore this finding from now on
		</ul>
	      ";
} elsif ( $topic eq "CHANGED" ) {
	print "
		Findings (the combinatiuon pluginID, port, host) get the status 
		CHANGED when:
		<ol>
			<li> Their previous status was OPEN or NO ISSUE, and
			<li> The output of the plugin changed
		</ol>
		It is suggested that you give findings one of following 
		statusses:
		<ul>
			<li> OPEN - This is a real security issue
			<li> NO ISSUE - This finding does not represent a 
				security issue
			<li> HARD MASKED - Ignore this finding from now on
		</ul>
	      ";
} elsif ( $topic eq "OPEN" ) {
	print "
		Findings get the OPEN status from a user when a finding 
		represents a security issue.
	      ";
} elsif ( $topic eq "GONE" ) {
	print "
		Findings (the combinatiuon pluginID, port, host) get the status 
		GONE when:
		<ol>
			<li> Their previous status was NEW, OPEN or NO ISSUE, 
				and
			<li> The output was not found on a subsequent scan
		</ol>
		It is suggested that you give findings one of following 
		statusses:
		<ul>
			<li> FIXED - If the finding has been cleared and should
				not reappear again
	      	</ul>
	      ";
} elsif ( $topic eq "NO ISSUE" ) {
	print "
		Findings get the NO ISSUE status from a user when a finding 
		does not represent a security issue.
	      ";
} elsif ( $topic eq "FIXED" ) {
	print "
		Findings get the FIXED status from a user when a finding should
		not reappear again.
	      ";
} elsif ( $topic eq "HARD MASKED" ) {
	print "
		Findings get the HARD MASKED status from a user when a finding 
		should be ignored in the future.
	      ";
} else {
	print "
		No help availabel for $topic
	      ";
}

