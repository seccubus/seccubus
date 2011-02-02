#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusScans;

my $query = CGI::new();
my $count = 0;

print $query->header("text/xml");

my $workspace_id = $query->param("workspaceID") or die "Cannot get workspaceID";
my $scan_id = $query->param("scanID") or die "Cannot get scanID";
my $scanname = $query->param("scanName") or die "Cannot get scanName";
my $scanner_name = $query->param("scannerName") or die "Cannot get scannerName";
my $scanner_param = $query->param("scannerParam") or die "Cannot get scannerParam";
my $targets = $query->param("Targets") or die "Cannot get Targets";
#my $workspace_id = 100;

my $result = update_scan($workspace_id, $scan_id, $scanname, $scanner_name, $scanner_param, $targets);

print "<updated>$result</updated>";
