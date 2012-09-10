#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# This little script checks all files te see if they are perl files and if so 
# ------------------------------------------------------------------------------

use strict;
use Test::More;

my $tests = 0;

open F, "jmvc/seccubus/seccubus.js" or diag("Unable to open jmvc/seccubus/seccubus.js");

while(<F>) {
	if ( $_ =~ /fixtures\.js/ ) {
		like( $_, qr/^\s*\/[\/\*]/, "fixtures.js disabled");
		$tests++;
	}
}
done_testing($tests);
