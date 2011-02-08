#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Get a table with the findings
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
	$host,
	$port,
	$plugin,
	$class,
	%names,
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
%findings = finding_tree($scan, $host, $port, $plugin);
%names = get_hostnames($scan);

# BUG [ 2531288 ] Bulk update on a large number of items
# Using a get method here will cause the system to run out of resources pretty 
# quickly. Changed it to post
#print "<form target='_blank' onSubmit='setTimeout(\"getFindings();\",2000);' name=\"bulk\" action=bulk_update.pl method=get>\n";
print "<form target='_blank' onSubmit='setTimeout(\"getFindings();\",2000);' name=\"bulk\" action=bulk_update.pl method=post>\n";
print "<input type=hidden name=scan value=$scan>\n";
print "Status : ", status_dropdown($status), "";
print "Remark: <textarea name=remark rows=1 cols=80></textarea>\n";
# BUG [ 1996774 ] Comment overwrite should be off by default
#print "<input type=checkbox name=overwrite checked=true>Overwrite\n";
print "<input type=checkbox name=overwrite>Overwrite\n";
print "<input type=submit name=submit disabled value=\"Bulk update selected\"><br><br>\n";

print "<TABLE id='finding'>
		<TR>
			<td>
				Id
			</td>
			<td>Host</td>
			<td>Text</td>
			<td>Remark</td>
			<td>Apply filter...</td>
			<td><input 
				type=\"checkbox\" 
				name=\"finding\" 
				value=\"dummy\"
				OnClick=\"for(i=1;i<finding.length;i++) {
						finding[i].checked=finding[0].checked;
					};
					submit.disabled = !this.checked
					open.disabled = !this.checked
				\">
				&nbsp;
				&nbsp;
				<input 
					type=button 
					name=open 
					value='Open'
					disabled
					onClick='
							for(i=1;i<finding.length;i++) { 
								if ( finding[i].checked ) {
									// Split value in host, port, plugin
									arr_param = finding[i].value.split(\"/\");
									window.open(\"view_finding.pl?scan=$scan&host=\" + arr_param[0] + \"&port=\" + arr_param[1] + \"&plugin=\" + arr_param[2]);
								}
							}
						'
				>
			</td>
		</TR>
";
	
if ( $findings{"STATUS_$status"} ) {
	foreach my $key ( sort @{$findings{"STATUS_$status"}} ) {
		($host, $port, $plugin) = split /\//, $key;
		$class = $findings{$host}{$port}{$plugin}{type};
		$class =~ s/\s/_/g;

		print "<tr>";
		print "<td class=\"$class\">";
		print "<a class=\"$class\" href='view_finding.pl?scan=$scan&host=$host&port=$port&plugin=$plugin' target='_blank'>";
		print "$host<br>$findings{$host}{$port}{$plugin}{port}<br>$plugin<br>$findings{$host}{$port}{$plugin}{type}</a></td>";
		print "<td>$host ($names{$host})</td>";
		# Ticket [ 2986053  ] - Findings >150 characters not truncated
		#$findings{$host}{$port}{$plugin}{text} =~ s/(.{150}).*/$1....../;
		if ( length($findings{$host}{$port}{$plugin}{text}) > 150 ) {
			$findings{$host}{$port}{$plugin}{text} = substr($findings{$host}{$port}{$plugin}{text},0,150) . ".....";
		}
		$findings{$host}{$port}{$plugin}{text} =~ s/\\n/<br>/g;
		print "<td>$findings{$host}{$port}{$plugin}{text}</td>";
		$findings{$host}{$port}{$plugin}{remark} = "&nbsp;" unless $findings{$host}{$port}{$plugin}{remark};
		$findings{$host}{$port}{$plugin}{remark} =~ s/\n/<br>\n/g;
		print "<td>$findings{$host}{$port}{$plugin}{remark}</td>";
		print "<td>";
		print "<a onClick='Host = \"$host\";getFindings();' href='#'>Host = $host</a><br>";
		print "<a onClick='Port = \"$port\";getFindings();' href='#'>Port = $port</a><br>";
		print "<a onClick='Plugin = \"$plugin\";getFindings();' href='#'>Plugin = $plugin</a><br>";
		print "</td>";
		print "<td><input 
				type=\"checkbox\" 
				name=\"finding\" 
				value=\"$host/$port/$plugin\"
			";
		print "onClick=\"submit.disabled=true;for(i=1;i<finding.length;i++) { if ( submit.disabled && finding[i].checked ) { submit.disabled=false ; open.disabled=false } }\" ></td>";
		print "</tr>\n";
	}
}

print "</TABLE></FORM>";

count_function(\%findings);
