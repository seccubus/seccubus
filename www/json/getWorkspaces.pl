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
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusWorkspaces;
#use HTML::Entities;

my $query = CGI::new();
my $json = JSON->new();
my $count = 0;
my @data;

print $query->header("application/json");

my $workspaces = get_workspaces;
foreach my $row ( @$workspaces ) {
	push @data, {
		'id'		=> $$row[0],
		'name'		=> $$row[1],
		'lastScan'	=> $$row[2],
		'findCount'	=> $$row[3],
		'scanCount'	=> $$row[4],
	};
};

print $json->pretty->encode(\@data);
exit;
