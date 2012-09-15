#!/usr/bin/env perl
# ------------------------------------------------------------------------------

use strict;
use Test::More tests => 10;

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

my $pwd = `pwd`;
chomp $pwd;
isnt(`grep $basedir/etc/config.xml  $basedir/SeccubusV2.pm`, "", "SeccubusV2.pm patched");
isnt(`grep $basedir/etc/config.xml  $basedir/www/seccubus/json/ConfigTest.pl`, "", "ConfigTest.pl patched");
is  (`grep $basedir  $basedir/etc/config.xml.mysql.example|wc -l`, "5\n", "config.xml.mysql.example patched");
