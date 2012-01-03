#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

# Fixes Ticket [ 2981907 ] - Online up2date check
use strict;
use lib "..";
use CGI;
use SeccubusV2;
use LWP::Simple;
use JSON;

#my (
   #);

my $query = CGI::new();
my $json = JSON->new();
my $data = [];

print $query->header("application/json");

my $verdict = get("http://v2.seccubus.com/up2date.json.pl?version=$SeccubusV2::VERSION");
if ( ! $verdict ) {
	print $json->pretty->encode( [ {
		'status'	=> "Error",
		'message'	=> "Cannot check version online! Online version checks are disabled",
		'link'		=> "",
	} ]);
} else { 
	print $verdict;
}
exit;
