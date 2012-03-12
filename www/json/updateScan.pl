#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Updates a scan
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusScans;

my $query = CGI::new();
my $json = JSON->new();

print $query->header("application/json");

my $scan_id = $query->param("id");
my $workspace_id = $query->param("workspace");
my $name = $query->param("name");
my $scanner = $query->param("scanner");
my $parameters = $query->param("parameters");
my $targets = $query->param("targets");

# Return an error if the required parameters were not passed 
if (not (defined ($scan_id))) {
	bye("Parameter id is missing");
};
if (not (defined ($workspace_id))) {
	bye("Parameter workspace is missing");
};
if (not (defined ($name))) {
	bye("Parameter name is missing");
};
if (not (defined ($scanner))) {
	bye("Parameter scanner is missing");
};
if (not (defined ($parameters))) {
	bye("Parameter parameters is missing");
};
if (not (defined ($targets))) {
	bye("Parameter targets is missing");
};

eval {
	my @data = ();
	update_scan($workspace_id,$scan_id,$name,$scanner,$parameters,$targets);
	push @data, {
		name		=> $name,
		scanner		=> $scanner,
		parameters	=> $parameters,
		targets		=> $targets,
	};
	print $json->pretty->encode(\@data);
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}

