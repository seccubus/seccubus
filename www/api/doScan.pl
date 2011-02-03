#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Runs a scan and returns the result when finished
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusScans;
use HTML::Entities;

my $query = CGI::new();
my $count = 0;

print $query->header("text/xml");

print "<seccubusAPI name='doScan'>\n";

my $workspace_id = $query->param("workspaceID");
my $scan_id = $query->param("scanID");
my $verbose = $query->param("verbose");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id) and defined ($scan_id))) {
	print "\t<result>NOK</result>
	<message>Invalid argument</message>
</seccubusAPI>";	
	exit;
}

eval {
	my $result = run_scan($workspace_id, $scan_id, $verbose);

	print "\t<result>OK</result>
	<message>" . encode_entities($result) . "</message>
</seccubusAPI>";
} or do {
	print "\t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>";
}