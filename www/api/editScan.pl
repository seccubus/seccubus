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

print "<seccubusAPI name='editScan'>\n";

my $workspace_id = $query->param("workspaceID");
my $scan_id = $query->param("scanID");
my $scanname = $query->param("scanName");
my $scanner_name = $query->param("scannerName");
my $scanner_param = $query->param("scannerParam");
my $targets = $query->param("Targets");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id) and defined ($scan_id) and
		 defined ($scanname) and defined ($scanner_name) and
		 defined ($scanner_param) ) ) {
	print "\t<result>NOK</result>
	<message>Invalid arguments</message>
</seccubusAPI>";	
	exit;
}

eval {
	my $result = update_scan($workspace_id, $scan_id, $scanname, $scanner_name, $scanner_param, $targets);

	print "\t<result>OK</result>
	<message>$result Scans successfully updated</message>
</seccubusAPI>";

} or do {
	print "\t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>"; 
}
