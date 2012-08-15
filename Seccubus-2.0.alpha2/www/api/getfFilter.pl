#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# List the scans
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusFindings;
use HTML::Entities;

my $query = CGI::new();
my $count = 0;
my ( 
	%hosts,
	%hostnames,
	%ports,
	%plugins,
	%severities,
	%status,
	%severity,
   );

my %filter;
foreach my $key ( qw( host hostname port plugin severity ) ) {
        if ($query->param($key) and $query->param($key) ne "all" and $query->param($key) ne "null" ) {
                $filter{$key} = $query->param($key);
        }
}
$filter{finding} = $query->param("finding") if $query->param("finding");
$filter{remark} = $query->param("remark") if $query->param("remark");

print $query->header("text/xml");

my $workspace_id = $query->param("workspaceID") or die "Cannot get workspaceID";
#my $workspace_id = 100;
my $scan_id = $query->param("scanID");
#my $scan_id=1;
$scan_id = 0 unless $scan_id;

my $findings = get_findings($workspace_id, $scan_id, \%filter);

foreach my $row ( @$findings ) {
	# Records: 0 - id, 1 - host, 2- hostname, 3 - port, 4 - plugin, 
	# 5 - finding, 6 - remark, 7 - severity_id, 8 - severity, 
	# 9 - status_id, 10 - status

	# hosts
	$hosts{"all"}->{$$row[9]}++; # Get hosts
	$hosts{"all"}->{"all"}++; # Get hosts
	$hosts{$$row[1]}->{$$row[9]}++; # Get hosts
	$hosts{$$row[1]}->{"all"}++; # Get hosts
	# Deal with IP groups
	if ( $$row[1] =~ /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/ ) {
		$hosts{"$1.$2.$3.*"}->{$$row[9]}++;
		$hosts{"$1.$2.$3.*"}->{"all"}++;
		$hosts{"$1.$2.*"}->{$$row[9]}++;
		$hosts{"$1.$2.*"}->{"all"}++;
		$hosts{"$1.*"}->{$$row[9]}++;
		$hosts{"$1.*"}->{"all"}++;
	}

	# hostnames
	$hostnames{"all"}->{$$row[9]}++;
	$hostnames{"all"}->{"all"}++;
	$hostnames{$$row[2]}->{$$row[9]}++;
	$hostnames{$$row[2]}->{"all"}++;

	# ports
	$ports{"all"}->{$$row[9]}++;
	$ports{"all"}->{"all"}++;
	$ports{$$row[3]}->{$$row[9]}++;
	$ports{$$row[3]}->{"all"}++;

	# plugins
	$plugins{"all"}->{$$row[9]}++;
	$plugins{"all"}->{"all"}++;
	$plugins{$$row[4]}->{$$row[9]}++;
	$plugins{$$row[4]}->{"all"}++;

	# severities
	$severities{"all"}->{$$row[9]}++;
	$severities{"all"}->{"all"}++;
	$severities{$$row[7]}->{$$row[9]}++;
	$severities{$$row[7]}->{"all"}++;
	$severity{$$row[7]} = $$row[8];
}

print "<filters>\n";

print "\t<hosts>\n";
foreach my $host ( sort keys %hosts ) {
	print "<host ";
	foreach my $stat ( sort keys %{$hosts{$host}} ) {
		print "count_$stat='$hosts{$host}->{$stat}' ";
	}
	print ">$host</host>\n";
}
print "\t</hosts>\n";

print "\t<hostnames>\n";
foreach my $hostname ( sort keys %hostnames ) {
	print "<hostname ";
	foreach my $stat ( sort keys %{$hostnames{$hostname}} ) {
		print "count_$stat='$hostnames{$hostname}->{$stat}' ";
	}
	print ">$hostname</hostname>\n";
}
print "\t</hostnames>\n";

print "\t<ports>\n";
foreach my $port ( sort { $a <=> $b } keys %ports ) {
	print "<port ";
	foreach my $stat ( sort keys %{$ports{$port}} ) {
		print "count_$stat='$ports{$port}->{$stat}' ";
	}
	print ">$port</port>\n";
}
print "\t</ports>\n";

print "\t<plugins>\n";
foreach my $plugin ( sort keys %plugins ) {
	print "<plugin ";
	foreach my $stat ( sort keys %{$plugins{$plugin}} ) {
		print "count_$stat='$plugins{$plugin}->{$stat}' ";
	}
	print ">$plugin</plugin>\n";
}
print "\t</plugins>\n";

$severity{"all"} = "all";
print "\t<severities>\n";
foreach my $sev ( sort keys %severities ) {
	print "<severity ";
	foreach my $stat ( sort keys %{$severities{$sev}} ) {
		print "count_$stat='$severities{$sev}->{$stat}' ";
	}
	print " id='$sev'>$severity{$sev}</severity>\n"
}
print "\t</severities>\n";

print "</filters>\n";
