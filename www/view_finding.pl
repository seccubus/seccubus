#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: view_finding.pl,v 1.7 2010/08/27 15:08:58 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# This module is used to view a finding in HTML
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use SeccubusWeb;
use Algorithm::Diff qw(diff);

my (
	%findings,
	%names,
	$date,
	@dates,
	@diff,
	$diff,
	@new,
	@old,
   );

my $VAR  = get_var;
my $CONFIG  = get_etc;
my $query = CGI::new();
my $scan = $query->param("scan") or die "Cannot get scan";
my $host = $query->param("host") or die "Cannot get host";
my $port = $query->param("port") or die "Cannot get port";
my $plugin = $query->param("plugin") or die "Cannot get plugin";
my $status = $query->param("status");
my $remark = $query->param("remark");

print_header();

%names = get_hostnames($scan);
print "<h1>$scan - $host ($names{$host}) - $port - $plugin</h1>";

if ( $status ) {
	print "<h2>Changing status</h2>\n";
	if ( check_status($status) ) {
		open( STATUS, ">$VAR/$scan/findings/$host/$port/$plugin/status" ) 
			or die "Unable to write status file $VAR/$scan/findings/$host/$port/$plugin/status";
		print STATUS $status;
		close STATUS;
		print "Status changed to $status";
	} else {
		print "Don't try to hack me please...";
	}
} 
if ( $remark ) {
	print "<h2>Changing remark</h2>\n";
	if ( $remark !~ /[\<\>]/ ) {
		open( REMARK, ">$VAR/$scan/findings/$host/$port/$plugin/remark" ) 
			or die "Unable to write status file $VAR/$scan/findings/$host/$port/$plugin/remark";
		print REMARK $remark;
		close REMARK;
		print "Remark changed to $remark";
	} else {
		print "Don't try to hack me please...";
	}
}

%findings = finding_tree($scan, $host, $port, $plugin);

foreach my $a_date (reverse sort keys %{$findings{$host}{$port}{$plugin}} ) {
	if ( $a_date =~ /^\d+$/ ) {
		$date = $a_date;
		last;
	}
}

$findings{$host}{$port}{$plugin}{text} =~ s/\</&lt;/g;
$findings{$host}{$port}{$plugin}{text} =~ s/\>/&gt;/g;
$findings{$host}{$port}{$plugin}{text} =~ s/\\n/\<br\>/g;

@dates = reverse sort keys %{$findings{$host}{$port}{$plugin}};
$date = shift @dates;
while ( $date && $date !~ /^\d+$/ ) {
	$date = shift @dates;
}
if ( @dates > 0 ) {
	@new = split /\\n/, $findings{$host}{$port}{$plugin}{"$date/text"};
	@old = split /\\n/, $findings{$host}{$port}{$plugin}{"$dates[1]"};
	@diff = diff( \@old, \@new );
	foreach ( @diff ) {
		foreach ( @$_ ) {
			$diff .= join " ", @$_;
			$diff .= "\n";
		}
	}
}
if ( $diff ) {
	$diff =~ s/\</&lt;/g;
	$diff =~ s/\>/&gt;/g;
	$diff =~s/\n/\<br\>\n/g;
	open (IGNORE, "$CONFIG/ignore_diffs" ) or die "Unable to open diff prefs file";
	foreach ( <IGNORE> ) {
		chomp;
		$diff =~ s/($_)/\<\/b\>* IGNORED $1\<b\>/g;
	}
	close IGNORE;
}

print "<h2>Most recent status</h2>";
print "<table>\n";
print "<tr><td>Host</td><td>$host ($names{$host})</td></tr>";
print "<tr><td>Status</td><td>";
print "<form action=view_finding.pl method=post>";
print "<input type=hidden name=scan value=$scan>\n";
print "<input type=hidden name=host value=$host>\n";
print "<input type=hidden name=port value=$port>\n";
print "<input type=hidden name=plugin value=$plugin>\n";
print status_dropdown($findings{$host}{$port}{$plugin}{status});
print "<input type=submit name=submit value=\"Change status and description\">\n";
print "</td></tr>";
print "<tr><td>Last seen</td><td>$date</td></tr>";
print "<tr><td>Port</td><td>$findings{$host}{$port}{$plugin}{port}</td></tr>";
print "<tr><td>Type</td><td>$findings{$host}{$port}{$plugin}{type}</td></tr>";
print "<tr><td>Text</td><td>", add_external_references($findings{$host}{$port}{$plugin}{text}), "</td></tr>";
$diff = "&nbsp;" unless $diff;
print "<tr><td>Diff</td><td>$diff</td></tr>";
print "<tr><td>Remark</td><td>";
print "<textarea name=remark rows=10 cols=80>$findings{$host}{$port}{$plugin}{remark}</textarea><br>\n";
print "<input type=submit name=submit value=\"Change remark and status\"></form>\n";
print "</td></tr>";
print "</table>\n";

print "<h2>History</h2>";
print "<table>\n";
$date = shift @dates;
while ( $date ) {
	if ( $date =~ /^\d+$/ ) {
		$diff = "";
		while ( @dates > 0 && @dates[1] !~ /^\d+$/ ) {
			shift @dates;
		}
		if ( @dates > 0 ) {
			@new = split /\\n/, $findings{$host}{$port}{$plugin}{"$date/text"};
			@old = split /\\n/, $findings{$host}{$port}{$plugin}{"$dates[1]/text"};
			@diff = diff( \@old, \@new );
			foreach ( @diff ) {
				foreach ( @$_ ) {
					$diff .= join " ", @$_;
					$diff .= "\n";
				}
			}

		}
		if ( $diff ) {
			$diff =~ s/\</&lt;/g;
			$diff =~ s/\>/&gt;/g;
			$diff =~s/\n/\<br\>\n/g;
			open (IGNORE, "$CONFIG/ignore_diffs" ) or die "Unable to open diff prefs file";
			foreach ( <IGNORE> ) {
				chomp;
				$diff =~ s/($_)/\<\/b\>* IGNORED $1\<b\>/g;
			}
			close IGNORE;
		}
		$findings{$host}{$port}{$plugin}{"$date/text"} =~ s/\</&lt;/g;
		$findings{$host}{$port}{$plugin}{"$date/text"} =~ s/\>/&gt;/g;
		$findings{$host}{$port}{$plugin}{"$date/text"} =~ s/\\n/<br>/g;
		print "<tr><td rowspan=3>$date</td>";
		print "<td>Port</td><td>" . $findings{$host}{$port}{$plugin}{"$date/port"} . "</td></tr>";
		print "<tr><td>Text</td><td>" . $findings{$host}{$port}{$plugin}{"$date/text"} . "</td></tr>";
		print "<tr><td>Diff</td><td><b>$diff&nbsp;</b></td></tr>";
	}
	$date = shift @dates;
}
print "</table>\n";

print_footer();
