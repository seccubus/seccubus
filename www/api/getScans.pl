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
use SeccubusScans;

my $query = CGI::new();
my $count = 0;

print $query->header("text/xml");

my $workspace_id = $query->param("workspaceID") or die "Cannot get workspaceID";
#my $workspace_id = 100;

my $scans = get_scans($workspace_id);

print "<scans>\n";
foreach my $row ( @$scans ) {
	print "\t<scan id='$$row[0]' 
			scanner='$$row[2]' 
			scannerparam='$$row[3]'
			lastrun='$$row[4]'
			total_runs='$$row[5]'
			findings='$$row[6]'
		 >
		 <name>$$row[1]</name></scan>\n";
	$count++;
}
print "\t<count>$count</count>\n";
print "</scans>\n";
