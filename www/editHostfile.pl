#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: editHostfile.pl,v 1.6 2010/07/05 12:17:04 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# Edit the hosts file for a certain scan.
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------
use strict;
use CGI;
use SeccubusWeb;
use Algorithm::Diff qw(diff);

my (
	$hostfile,
   );

my $VAR  = get_var;
my $query = CGI::new();
my $scan = $query->param("scan") or die "Cannot get scan";

print $query->header("text/plain");
check_permission($scan);

if ( -e "$VAR/$scan/hostnames" ) {
	open( HOSTFILE, "$VAR/$scan/hostnames" ) or die "Unable to open hostfile";
	$hostfile = join "", <HOSTFILE>;
	close HOSTFILE;
}

print "<form method=\'POST\' onSubmit='setTimeout(\"getHostFile(Scan);\",2000);' action=\'writeHostfile.pl\' target=\'_blank\'>\n";
print "<input type=\'hidden\' name=\'scan\' value=\'$scan\'>\n";
print "<textarea name=hostfile rows=25 cols=80>$hostfile</textarea><br>\n";
print "<input type=submit name=submit value=\"Change hostfile\"></form>\n";

