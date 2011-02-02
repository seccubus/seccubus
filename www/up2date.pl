#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: up2date.pl,v 1.1 2010/04/04 21:17:33 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

# Fixes Ticket [ 2981907 ] - Online up2date check
use strict;
use CGI;
use LWP::Simple;
use SeccubusWeb;

#my (
   #);

my $query = CGI::new();

print $query->header("text/plain");

my $verdict = get("http://v1.seccubus.com/up2date.pl?version=$SeccubusWeb::VERSION");
$verdict = "Cannot check version online!" unless $verdict;
print $verdict;
