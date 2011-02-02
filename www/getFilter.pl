#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: getFilter.pl,v 1.3 2009/12/17 15:04:30 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# Get updated filter dropdowns
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use SeccubusWeb;


my (
	@dates,
	$color,
	%findings,
	%all_findings,
	%names,
	$finding,
	$host,
	$port,
	$plugin,
	$shost,
	$sport,
	$splugin,
	%hosts,
	%ports,
	%plugins,
	$total,
	$found,
   );

my $query = CGI::new();
my $status = $query->param("status") or die "Cannot get status";
my $scan = $query->param("scan") or die "Cannot get scan";
my $host = $query->param("host");
my $port = $query->param("port");
my $plugin = $query->param("plugin");

print $query->header("text/plain");
check_permission($scan);
check_param($scan);
#%all_findings = finding_tree($scan);
%names = get_hostnames($scan);


%findings = finding_tree($scan, "*", $port, $plugin);
$total = 0;
if ( $findings{"STATUS_$status"} ) {
	foreach my $key ( sort @{$findings{"STATUS_$status"}} ) {
		my ($fhost, $fport, $fplugin) = split /\//, $key;
		$hosts{$fhost}++;
		if ( $fhost =~ /(\d+)\.(\d+)\.(\d+)\.\d+/ ) {
			$hosts{"$1.$2.$3.*"}++;
			$hosts{"$1.$2.*"}++;
			$hosts{"$1.*"}++;
		}
		$total++;
	}
}

print "<b>Filter : </b> Host = ";
print "<select name=ip_filter onChange='Host = this.value;getFindings()';>\n";
print "<option value=''>* ($total findings)\n";
$found = 0;
foreach my $item ( sort keys %hosts ) {
	print "<option value='$item'";
	if ( $item eq $host ) {
		print "selected ";
		$found = 1;
	}
	print ">$item ($names{$item}) ($hosts{$item} findings)\n";
}
if ( $host && ! $found ) {
	print "<option value='$host' selected>$host ($names{$host}) (0 findings)\n";
}
print "</select> ";

%findings = finding_tree($scan, $host, "*", $plugin);
$total = 0;
if ( $findings{"STATUS_$status"} ) {
	foreach my $key ( sort @{$findings{"STATUS_$status"}} ) {
		my ($fhost, $fport, $fplugin) = split /\//, $key;
		$ports{$fport}++;
		$total++;
	}
}

print "Port = ";
print "<select name=port_filter onChange='Port = this.value;getFindings();'>\n";
print "<option value=''>* ($total findings)\n";
$found = 0;
foreach my $item ( sort keys %ports ) {
	print "<option value='$item'";
        if ( $item eq $port ) {
                print "selected ";
                $found = 1;
        }
	print ">$item ($ports{$item} findings)\n";
}
if ( $port && ! $found ) {
	print "<option value='$port' selected>$port (0 findings)\n";
}
print "</select> ";

%findings = finding_tree($scan, $host, $port, "*");
$total = 0;
if ( $findings{"STATUS_$status"} ) {
	foreach my $key ( sort @{$findings{"STATUS_$status"}} ) {
		my ($fhost, $fport, $fplugin) = split /\//, $key;
		$plugins{$fplugin}++;
		$total++;
	}
}

print "Plugin = ";
print "<select name=plugin_filter onChange='Plugin = this.value;getFindings();'>\n";
print "<option value=''>* ($total findings)\n";
$found = 0;
foreach my $item ( sort keys %plugins ) {
	print "<option value='$item'";
        if ( $item eq $plugin ) {
                print "selected ";
                $found = 1;
        }
	print ">$item ($plugins{$item} findings)\n";
}
if ( $plugin && ! $found ) {
	print "<option value='$plugin' selected>$plugin (0 findings)\n";
}
print "</select> ";
print "<a href='#' onClick='clearFilter();getFindings(ScanStatus);'>Clear</a> ";
print "<a href='#' onClick='getFindings(ScanStatus);'>Refresh</a>";
