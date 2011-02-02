#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Get a full list of findings associated with the filter parameters given
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
my %counter;

print $query->header("text/xml");

my $workspace_id = $query->param("workspaceID") or die "Cannot get workspaceID";
#my $workspace_id = 100;
my $scan_id = $query->param("scanID");
#my $scan_id=1;
$scan_id = 0 unless $scan_id;

my %filter;
foreach my $key ( qw( host hostname port plugin severity ) ) {
	if ($query->param($key) and $query->param($key) ne "all" and $query->param($key) ne "null" ) {
		$filter{$key} = $query->param($key); 
	}
}
$filter{finding} = $query->param("finding") if $query->param("finding");
$filter{remark} = $query->param("remark") if $query->param("remark");

my $findings = get_findings($workspace_id, $scan_id, \%filter);

print "<findings>\n";
foreach my $row ( @$findings ) {
	$$row[5] = HTML::Entities::encode($$row[5]);
	$$row[5] =~ s/\n/\\n/g;
	$$row[6] = HTML::Entities::encode($$row[6]);
	$$row[6] =~ s/\n/\\n/g;
	print "\t<finding id='$$row[0]' 
			host='$$row[1]' 
			hostname='$$row[2]'
			port='$$row[3]'
			plugin='$$row[4]'
			remark='$$row[6]'
		 >
		 <severity id='$$row[7]'>$$row[8]</severity>
		 <status id='$$row[9]'>$$row[10]</status>";
	print "<output>$$row[5]</output>";
	print "</finding>\n";
	$count++;
	$counter{$$row[9]}++;
}
print "\t<count ";
foreach my $status ( sort keys %counter ) {
	print "status_$status='$counter{$status}' ";
}
print ">$count</count>\n";
my $filter = "";
foreach my $key (sort keys %filter ) {
	$filter .= "$key -> $filter{$key} - ";
}
#die $filter;
print "<filter>$filter</filter>\n";
print "</findings>\n";
