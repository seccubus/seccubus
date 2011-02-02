#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusWorkspaces;

my $query = CGI::new();
my $count = 0;

print $query->header("text/xml");

my $workspaces = get_workspaces;

print "<workspaces>\n";
foreach my $row ( @$workspaces ) {
	print "\t<workspace 
		  	id='$$row[0]'
		  	lastrun='$$row[2]'
		  	findings='$$row[3]'
		  	scans='$$row[4]'
		 >
		 	<name>$$row[1]</name>
		 </workspace>\n";
	$count++;
}
print "\t<count>$count</count>\n";
print "</workspaces>\n";
