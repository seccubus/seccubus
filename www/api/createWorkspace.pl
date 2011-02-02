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

my $workspaceName = $query->param("workspaceName");


my $newid;

# Create the new workspace
$newid = create_workspace($workspaceName);

if ($newid == 0) {
	print "<result>
	<status>exists</status>
</result>\n";
} else {
	print "<result>
	<status>$newid</status>
</result>\n";
}
