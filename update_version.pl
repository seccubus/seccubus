#!/usr/bin/perl 

use strict;


if ( $ENV{BUILD_NUMBER} ) {
	use lib "SeccubusV2";
	use SeccubusV2;

	my $line = $SeccubusV2::VERSION;
	my $replace = $SeccubusV2::VERSION . ".$ENV{BUILD_NUMBER}";
	print("sed -i 's:$line:$replace:' SeccubusV2.pm\n");
}
