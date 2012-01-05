#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Updates the findings passed by ID with the data passed
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------
use strict;
use CGI;
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusFindings;

my $query = CGI::new();
my $json = JSON->new();

print $query->header("application/json");

my $workspace_id = $query->param("workspaceId");
my @ids = $query->param("ids[]");
my $remark = $query->param("remark");
my $status = $query->param("status");
my $overwrite = $query->param("overwrite");

if ( $overwrite eq "true" || $overwrite == 1 ) {
	$overwrite = 1;
} else {
	$overwrite = 0;
}

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
};
if (@ids == 0) {
	bye("No id's passed");
};

if ( $status < 0 || ( $status > 6 && $status != 99 ) ) {
	bye("Invalid status code");
}

eval {
	my @data = ();
	foreach my $id (@ids) { 
		update_finding(	"finding_id"	=> $id,
			"workspace_id"	=> $workspace_id,
			"status"	=> $status,
			"remark"	=> $remark,
			"overwrite"	=> $overwrite,
		);
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



