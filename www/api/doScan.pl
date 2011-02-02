#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Runs a scan and returns the result when finished
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusScans;
use HTML::Entities;

my $query = CGI::new();
my $count = 0;

print $query->header("text/xml");

my $workspace_id = $query->param("workspaceID") or die "Cannot get workspaceID";
my $scan_id = $query->param("scanID") or die "Cannot get scanID";
my $verbose = $query->param("verbose");

my $result = run_scan($workspace_id, $scan_id, $verbose);

print "<result>\n";
print encode_entities($result);
print "</result>\n";
