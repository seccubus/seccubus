#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Edit a new workspace name
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusWorkspaces;

my $query = CGI::new();

print $query->header("text/xml");

print "<seccubusAPI name='editWorkspace'>\n";

my $workspaceName = $query->param("workspaceName");
my $newWorkspaceName = $query->param("newWorkspaceName");

# Return an error if the required parameters were not passed 
if (not (defined ($workspaceName) and defined ($newWorkspaceName))) {
	print "\t<result>NOK</result>
	<message>Invalid argument</message>
</seccubusAPI>";
 exit;	
}

eval {
	# Edit the workspace name
	my $result = edit_workspace($workspaceName, $newWorkspaceName);

	print "\t<result>OK</result>
	<message>Workspace $workspaceName successfully changed to $newWorkspaceName</message>
</seccubusAPI>";
} or do {
	print "\t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>";
}