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
use HTML::Entities;

my $query = CGI::new();
my $count = 0;

print $query->header("text/xml");

print "<seccubusAPI name='getScans'>\n";

my $workspace_id = $query->param("workspaceID");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	print "\t<result>NOK</result>
	<message>Invalid argument</message>
</seccubusAPI>";	
	exit;
}

eval {
	my $scans = get_scans($workspace_id);

	print "\t<result>OK</result>
	<data>
		<scans>\n";
		
	foreach my $row ( @$scans ) {
		print "\t\t\t<scan>
				<id>$$row[0]</id>
				<name>". encode_entities($$row[1]) ."</name> 
				<scanner>$$row[2]</scanner> 
				<scannerparam>". encode_entities($$row[3]) ."</scannerparam>
				<lastrun>$$row[4]</lastrun>
				<total_runs>$$row[5]</total_runs>
				<findings>$$row[6]</findings>
				<targets>". encode_entities($$row[7]) ."</targets>
			</scan>\n";
		$count++;
	}
	print "\t\t\t<count>$count</count>
		</scans>
	</data>
	<message>$count Scans have been returned</message>
</seccubusAPI>";

} or do {
	print "\t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>";
}