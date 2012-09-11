#!/usr/bin/env perl
# ------------------------------------------------------------------------------

use strict;
use Test::More tests => 7;

my $basedir = "tmp/install/seccubus";

my $diff = `diff $basedir/SeccubusV2.pm $basedir/www/seccubus/SeccubusV2.pm 2>&1`;
cmp_ok($diff, "eq", "", "Symlink in $basedir/www/seccubus/SeccubusV2.pm");

foreach my $dir ( qw(
			www/
			www/seccubus
			www/steal
			www/seccubus
			www/seccubus/img
			www/seccubus/json
		  ) ) {
	if ( -d "$basedir/$dir" ) {
		pass("$basedir/$dir");
	} else {
		fail("$basedir/$dir");
	}
}

