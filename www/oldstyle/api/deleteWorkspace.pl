#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Delete a workspace
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusWorkspaces;

my $query = CGI::new();

print $query->header("text/xml");

print "<seccubusAPI name='deleteWorkspace'>\n";

my $workspaceName = $query->param("workspaceName");

# Return an error if the required parameters were not passed 
if (not (defined ($workspaceName))) {
	print "\t<result>NOK</result>
	<message>Invalid argument</message>
</seccubusAPI>";	
	exit;
}

eval {
	# Delete the workspace and all associated data  
	my $result = delete_workspace($workspaceName, "verbose");	# use delete_workspace($workspaceName, "verbose"); to get debug statements

	print "\t<result>OK</result>
	<message>$result</message>
</seccubusAPI>";
} or do {
	print "/t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>";
}