#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: getScanInfo.pl,v 1.4 2009/12/17 15:04:30 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# get Diffs, reports and other scan info
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
   );

my $query = CGI::new();
my $scan = $query->param("scan") or die "Cannot get scan";

print $query->header("text/plain");
check_permission($scan);
check_param($scan);
%findings = finding_tree($scan);

my %hosts = hosts_by_date($scan);

print "<h2>This is an overview of available reports:</h2>";

print "<TABLE><TR><TD>Date</TD><td colspan=4 align=center>report type</TD><td>Changes</td></TR>\n";
foreach my $key (reverse sort keys %hosts) {
	print "<TR>
		<TD>$key</td>
		<td><a target='_blank' href=get_report.pl?scan=$scan&date=$key&type=html>html</a></td>
		<td><a target='_blank' href=get_report.pl?scan=$scan&date=$key&type=xml>xml</a></td>
		<td><a target='_blank' href=get_report.pl?scan=$scan&date=$key&type=nbe>nbe</a></td>
		<td><a target='_blank' href=get_report.pl?scan=$scan&date=$key&type=rpt>changes</a></td>
		<td>";
	print get_changes($scan, $key);
	print "</tr>";
}
print "</table>\n";

count_function(\%findings);
