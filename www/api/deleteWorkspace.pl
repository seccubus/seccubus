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

my $workspaceName = $query->param("workspaceName");

# Delete the workspace and all associated data  
my $result = delete_workspace($workspaceName);	# use delete_workspace($workspaceName, "verbose"); to get debug statements

if ($result == 0) {
	print "<result>
	<status>fail</status>
</result>\n";
} else {
	print "<result>
	<status>success</status>
</result>\n";
}
