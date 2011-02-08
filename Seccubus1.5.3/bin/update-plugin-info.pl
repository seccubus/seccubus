#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# THis scripts gets the plugins.txt file and stores it in separate files in 
# the var/.plugin directory
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;

open(PLUGINS, "$ENV{VAR}/.plugins/plugins.txt") or die "Unable to open plugin file";

while (<PLUGINS>) {
	chomp;

	my @fields = split /\|/, $_, 11;

	open(PLUGIN, ">var/.plugins/$fields[0]") or die "Unable to open plugin info for $fields[0]";

	print PLUGIN $_;
	close PLUGIN;
}
