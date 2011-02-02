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
use lib "..";
use SeccubusV2;
use SeccubusFindings;

my $query = CGI::new();

print $query->header("text/xml");
my $workspaceid = $query->param("workspaceid") or die "No workspaceid provided";
my @ids = $query->param("ids[]");
my $remark = $query->param("remark");
my $status = $query->param("status");
my $overwrite = $query->param("overwrite");

if ( $overwrite eq "true" || $overwrite == 1 ) {
	$overwrite = 1;
} else {
	$overwrite = 0;
}

if ( @ids == 0 ) {
	die "No ids passed to update";
} else {
	if ( $status < 0 || ( $status > 6 && $status != 99 ) ) {
		die "Illegal status value";
	}
}

print "<updates>";
for my $id ( @ids ) {
	print "<finding id='$id'>";
	update_finding(	"finding_id"	=> $id,
			"workspace_id"	=> $workspaceid,
			"status"	=> $status,
			"remark"	=> $remark,
			"overwrite"	=> $overwrite,
		      );
	print "OK</finding>";
};
print "<remark>$remark</remark>";
print "<status>$status</status>";
print "<overwrite>$overwrite</overwrite>";
print "</updates>";

