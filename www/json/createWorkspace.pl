#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Creates a new workspace
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------
use strict;
use CGI;
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
my $workspace_name = $query->param("name");
if (not (defined ($workspace_name))) {
	bye("Parameter name is missing");
};

eval {
	my @data = ();
	my $newid = create_workspace($workspace_name);
	push @data, {
		id		=> $newid,
		name		=> $workspace_name,
		scanCount	=> 0,
		findCount	=> 0
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

