#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Updates the workspace passed by ID with the data passed
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusWorkspaces;

my $query = CGI::new();
my $json = JSON->new();

print $query->header("application/json");

my $workspace_id = $query->param("workspaceId");
my $id = $query->param("id");
my $remark = $query->param("remark");
my $status = $query->param("status");
my $overwrite = $query->param("overwrite");

if ( $overwrite eq "true" || $overwrite == 1 ) {
	$overwrite = 1;
} else {
	$overwrite = 0;
}

# Return an error if the required parameters were not passed 
my $workspace_id = $query->param("id");
if (not (defined ($workspace_id))) {
	bye("Parameter name is missing");
};
my $workspace_name = $query->param("name");
if (not (defined ($workspace_name))) {
	bye("Parameter name is missing");
};

eval {
	my @data = ();
	edit_workspace($workspace_id, $workspace_name);
	push @data, {
		name	=> $workspace_name
	};
	print $json->pretty->encode(\@data);
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}

