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
use SeccubusScanners;

my $query = CGI::new();
my $json = JSON->new();

print $query->header("application/json");

eval {
	my @data;
	my $scanners = get_scanners(); # Get somethin here

	foreach my $row ( @$scanners ) {
		push (@data, {
			'name'		=> $$row[0],
			'description'	=> $$row[1],
			'help'		=> $$row[2],
		});
	}
	print $json->pretty->encode(\@data);
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}
