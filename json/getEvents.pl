#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusEvents;
#use HTML::Entities;

my $query = CGI::new();
my $json = JSON->new();
my $count = 0;
my @data;

print $query->header("application/json");

my $events = get_events;
foreach my $row ( @$events ) {
	push @data, {
		'id'		=> $$row[0],
		'name'		=> $$row[1],
	};
};

print $json->pretty->encode(\@data);
exit;
