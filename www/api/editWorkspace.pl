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

my $workspaceName = $query->param("workspaceName");
my $newWorkspaceName = $query->param("newWorkspaceName");

# Edit the workspace name
my $result = edit_workspace($workspaceName, $newWorkspaceName);

print "<result>
	<status>$result</status>
</result>\n";
