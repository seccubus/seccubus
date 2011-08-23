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

print "<seccubusAPI name='getFindings'>\n";

my $workspace_id = $query->param("workspaceID");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	print "\t<result>NOK</result>
	<message>Invalid argument</message>
</seccubusAPI>";
 exit;	
}

eval {
	my $scan_id = $query->param("scanID");
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

	print "\t<result>OK</result>
	<data>
		<findings>\n";
		
	foreach my $row ( @$findings ) {
		$$row[4] = HTML::Entities::encode($$row[4]);
		$$row[5] = HTML::Entities::encode($$row[5]);
		$$row[5] =~ s/\n/\\n/g;
		$$row[6] = HTML::Entities::encode($$row[6]);
		$$row[6] =~ s/\n/\\n/g;
		print "\t\t\t<finding id='$$row[0]' 
				host='$$row[1]' 
				hostname='$$row[2]'
				port='$$row[3]'
				plugin='$$row[4]'
				remark='$$row[6]'
		 		>
		 		<severity id='$$row[7]'>$$row[8]</severity>
		 		<status id='$$row[9]'>$$row[10]</status>
		 		<output>$$row[5]</output>
			</finding>\n";
		
		$count++;
		$counter{$$row[9]}++;
	}
	print "\t\t\t<count ";
	foreach my $status ( sort keys %counter ) {
		print "status_$status='$counter{$status}' ";
	}
	print ">$count</count>\n";
	my $filter = "";
	foreach my $key (sort keys %filter ) {
		$filter .= "$key -> $filter{$key} - ";
	}
	#die $filter;
	print "\t\t\t<filter>$filter</filter>
		</findings>
	</data>
	<message>$count Findings have been returned</message>
</seccubusAPI>\n";
} or do {
	print "\t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>"; 
}
