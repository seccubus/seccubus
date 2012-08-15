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
use HTML::Entities;

my $query = CGI::new();
my $count = 0;

print $query->header("text/xml");

print "<seccubusAPI name='getWorkspaces'>\n";

eval {
	my $workspaces = get_workspaces;

	print "\t<result>OK</result>
	<data>
		<workspaces>\n";
	foreach my $row ( @$workspaces ) {
		print "\t\t\t<workspace>
				<id>$$row[0]</id>
				<name>" . encode_entities($$row[1]) ."</name>
		  		<lastrun>$$row[2]</lastrun>
		  		<findings>$$row[3]</findings>
		  		<scans>$$row[4]</scans>
		 	</workspace>\n";
	$count++;
	}
	print "\t\t\t<count>$count</count>
		</workspaces>
	</data>
	<message>$count Workspaces have been returned</message>
</seccubusAPI>";

} or do {
	print "\t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>";
}