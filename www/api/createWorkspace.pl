#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Create a new workspace
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusWorkspaces;

my $query = CGI::new();

print $query->header("text/xml");

print "<seccubusAPI name='createWorkspace'>\n";

my $workspaceName = $query->param("workspaceName");

# Return an error if the required parameters were not passed 
if (not (defined ($workspaceName))) {
	print "\t<result>NOK</result>
	<message>Invalid argument</message>
</seccubusAPI>";
 exit;	
}

eval {
	# Create the new workspace
	my $newid = create_workspace($workspaceName);

	print "\t<result>OK</result>
	<message>Workspace $workspaceName successfully created</message>
</seccubusAPI>";
} or do {
	print "\t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>";
}