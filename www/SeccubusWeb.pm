# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Seccubus perl module. This is where most of the real logic is
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------
package SeccubusWeb;

use CGI;
use Exporter;
@ISA = ('Exporter');

# You need to point this to where Seccubus lives
our $VAR  = '/home/seccubus/var';
our $ETC  = '/home/seccubus/etc';

# These methods are exported from the package
@EXPORT = qw ( 
		print_header
		print_footer
		hosts_by_date
		get_changes
		finding_tree
		status_dropdown
		check_status
		check_date
		check_param
		add_external_references
		get_stati
		get_hostnames
		check_permission
		count_function
		get_var
		get_etc
		VERSION
	);

$VERSION = '1.5.5';
# BUG [ 2130297 ] Make the scan list also show the version of Seccubus
# Moved version into this file so it can be read by getScans.pl

use strict;

# List of acceptable stati for a finding
my @stati = (
	"NEW",
	"CHANGED",
	"OPEN",
	"GONE",
	"NO ISSUE",
	"FIXED",
	"HARD MASKED",
);

my $query = CGI::new();

# This module print the HTML header ofr each page and does some basic security
# checking at the same time
sub print_header() {
	my $scan = $query->param("scan");
	my $user = $ENV{REMOTE_USER};
	my @lines;
	my $line;

	# Check parameters
	check_param($query->param("scan")) if $query->param("scan"); 
	check_param($query->param("host")) if $query->param("host"); 
	check_param($query->param("port")) if $query->param("port"); 
	check_param($query->param("plugin")) if $query->param("plugin"); 
	check_param($query->param("status")) if $query->param("status"); 
	check_param($query->param("type")) if $query->param("type"); 

	check_date($query->param("date")) if $query->param("date"); 

	print $query->header();
	print '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">';

	check_permission($scan) if $scan;

	print '
	        <HTML>
			<HEAD>
				<TITLE>Seccubus';
	print " - ", $query->param("scan") if $query->param("scan");
	print " - ", $query->param("host") if $query->param("host");
	print " - ", $query->param("port") if $query->param("port");
	print " - ", $query->param("plugin") if $query->param("plugin");
	print			'</TITLE>
				<LINK HREF="style/sbp.css" TYPE="text/css" REL="stylesheet">
			</HEAD><BODY>';
	print "[<a href='#' onClick='window.close();'>close</a>] ";
}

sub print_footer() {
	print '		</BODY>
		</HTML>';
}


sub hosts_by_date($) {
	my $scan = shift;

	my (
		%findings_in,
		%findings,
	   );

	my @findings = <$VAR/$scan/findings/*/scan_*>;

	foreach ( @findings ) {
		my @fields = split /\//;
		$fields[-1] =~ s/scan_//;
		$findings_in{$fields[-1] . "/" . $fields[-2]} = "x";
	}
	foreach my $key ( keys %findings_in ) {
		my @fields = split /\//, $key;

		if ( $findings{$fields[0]} ) {
			$findings{$fields[0]} .= "<br>$fields[1]";
		} else {
			$findings{$fields[0]} .= "$fields[1]";
		}
	}
	return %findings;
}

sub finding_tree($;$$$) {
	my $scan = shift;
	my $host = shift;
	my $port = shift;
	my $plugin = shift;

	check_param($host);
	check_param($port);
	check_param($plugin);
	$host = "*" unless $host;
	$port = "*" unless $port;
	$plugin = "*" unless $plugin;

	my (
		%findings,
		$file,
	   );

	my @findings = <$VAR/$scan/findings/$host/$port/$plugin/*>;

	foreach ( @findings ) {
		my @fields = split /\//;

		# Read the actual text of the finding
		open (FILE, $_)  or die "Unable to open $_";
		$file = join("",<FILE>);
		close (FILE);
		chomp($file);

		# If the file is a status file store the finding reference in
		# the array belowing to this status
		if ( $fields[-1] eq "status" ) {
			if ( ! $findings{"STATUS_$file"} ) {
				@{$findings{"STATUS_$file"}} = ();
			}
			push @{$findings{"STATUS_$file"}}, "$fields[-4]/$fields[-3]/$fields[-2]";
		} elsif ( $fields[-1] eq "remark" ) {
			$findings{$fields[-4]}{$fields[-3]}{$fields[-2]}{remark} = $file;
		} else {
			my @nessus = split /\|/, $file, 7;
			$findings{$fields[-4]}{$fields[-3]}{$fields[-2]}{"$fields[-1]/port"} = $nessus[3];
			$findings{$fields[-4]}{$fields[-3]}{$fields[-2]}{"$fields[-1]/type"} = $nessus[5];
			$findings{$fields[-4]}{$fields[-3]}{$fields[-2]}{"$fields[-1]/text"} = $nessus[6];
			$findings{$fields[-4]}{$fields[-3]}{$fields[-2]}{port} = $nessus[3];
			$findings{$fields[-4]}{$fields[-3]}{$fields[-2]}{type} = $nessus[5];
			$findings{$fields[-4]}{$fields[-3]}{$fields[-2]}{text} = $nessus[6];
		}


		$findings{$fields[-4]}{$fields[-3]}{$fields[-2]}{$fields[-1]} = $file;

	}
	return %findings;
}

sub get_changes($$) {
	my $scan = shift;
	my $date = shift;

	my $report;
	my $line;

	open (RPT, "$VAR/$scan/output/$date.rpt") or die "Unable to open report ($VAR/$scan/output/$date.rpt)";
	while (<RPT> ) {
		chomp;
		$report .= "$_<br>";
	}
	close RPT;
	$report =~ s/(.{150}).*/$1.../;;

	$report = "NULL" unless $report;
	
	return $report;
}

sub status_dropdown ($) {
	my $status = shift;

	my $dropdown = "
		<SELECT NAME='status'>
		<option disabled='true'>--- Current status ---
		";

	# BUG [ 2043133 ] Make status selection smart
	#foreach ( @stati ) {
	#	if ( $_ eq $status ) {
	#		$dropdown .= "<OPTION SELECTED VALUE=\"$_\">$_\n";
	#	} else {
	#		$dropdown .= "<OPTION VALUE=\"$_\">$_\n";
	#	}
	#}
	
	if ( $status eq "NEW" ) {
		$dropdown .= "
			<OPTION SELECTED VALUE='NEW'>NEW
			<option disabled='true'>--- Recommended status ---
			<OPTION VALUE='OPEN'>OPEN
			<OPTION VALUE='NO ISSUE'>NO ISSUE
			<OPTION VALUE='HARD MASKED'>HARD MASKED
			<option disabled='true'>--- Other status ---
			<OPTION disabled='true' VALUE='CHANGED'>CHANGED
			<OPTION disabled='true' VALUE='GONE'>GONE
			<OPTION disabled='true' VALUE='FIXED'>FIXED
			";
	} elsif ( $status eq "CHANGED" ) {
		$dropdown .= "
			<OPTION SELECTED VALUE='CHANGED'>CHANGED
			<option disabled='true'>--- Recommended status ---
			<OPTION VALUE='OPEN'>OPEN
			<OPTION VALUE='NO ISSUE'>NO ISSUE
			<OPTION VALUE='HARD MASKED'>HARD MASKED
			<option disabled='true'>--- Other status ---
			<OPTION disabled='true' VALUE='NEW'>NEW
			<OPTION disabled='true' VALUE='GONE'>GONE
			<OPTION disabled='true' VALUE='FIXED'>FIXED
			";
	} elsif ( $status eq "OPEN" ) {
		$dropdown .= "
			<OPTION SELECTED VALUE='OPEN'>OPEN
			<option disabled='true'>--- Recommended status ---
			<OPTION VALUE='NO ISSUE'>NO ISSUE
			<OPTION VALUE='HARD MASKED'>HARD MASKED
			<option disabled='true'>--- Other status ---
			<OPTION disabled='true' VALUE='NEW'>NEW
			<OPTION disabled='true' VALUE='CHANGED'>CHANGED
			<OPTION disabled='true' VALUE='GONE'>GONE
			<OPTION disabled='true' VALUE='FIXED'>FIXED
			";
	} elsif ( $status eq "GONE" ) {
		$dropdown .= "
			<OPTION SELECTED VALUE='GONE'>GONE
			<option disabled='true'>--- Recommended status ---
			<OPTION VALUE='FIXED'>FIXED
			<OPTION VALUE='HARD MASKED'>HARD MASKED
			<option disabled='true'>--- Other status ---
			<OPTION disabled='true' VALUE='NEW'>NEW
			<OPTION disabled='true' VALUE='CHANGED'>CHANGED
			<OPTION disabled='true' VALUE='OPEN'>OPEN
			<OPTION disabled='true' VALUE='NO ISSUE'>NO ISSUE
			";
	} elsif ( $status eq "NO ISSUE" ) {
		$dropdown .= "
			<OPTION SELECTED VALUE='NO ISSUE'>NO ISSUE
			<option disabled='true'>--- Recommended status ---
			<OPTION VALUE='OPEN'>OPEN
			<OPTION VALUE='HARD MASKED'>HARD MASKED
			<option disabled='true'>--- Other status ---
			<OPTION disabled='true' VALUE='NEW'>NEW
			<OPTION disabled='true' VALUE='CHANGED'>CHANGED
			<OPTION disabled='true' VALUE='GONE'>GONE
			<OPTION disabled='true' VALUE='FIXED'>FIXED
			";
	} elsif ( $status eq "FIXED" ) {
		$dropdown .= "
			<OPTION SELECTED VALUE='FIXED'>FIXED
			<option disabled='true'>--- Recommended status ---
			<OPTION VALUE='NO ISSUE'>NO ISSUE
			<OPTION VALUE='HARD MASKED'>HARD MASKED
			<option disabled='true'>--- Other status ---
			<OPTION disabled='true' VALUE='NEW'>NEW
			<OPTION disabled='true' VALUE='CHANGED'>CHANGED
			<OPTION disabled='true' VALUE='OPEN'>OPEN
			<OPTION disabled='true' VALUE='GONE'>GONE
			";
	} elsif ( $status eq "HARD MASKED" ) {
		$dropdown .= "
			<OPTION SELECTED VALUE='HARD MASKED'>HARD MASKED
			<option disabled='true'>--- Recommended status ---
			<OPTION VALUE='OPEN'>OPEN
			<OPTION VALUE='NO ISSUE'>NO ISSUE
			<option disabled='true'>--- Other status ---
			<OPTION disabled='true' VALUE='NEW'>NEW
			<OPTION disabled='true' VALUE='CHANGED'>CHANGED
			<OPTION disabled='true' VALUE='GONE'>GONE
			<OPTION disabled='true' VALUE='FIXED'>FIXED
			";
	}

	$dropdown .= "</select>\n";

	return $dropdown;
}

sub check_status($) {
	my $status =shift;

	foreach ( @stati ) {
		if ( $status eq $_ ) {
			return 1;
		}
	}
	return 0;
}

sub check_date($) {
	my $date = shift;

	if ( $date !~ /^\d{12}$/ ) {
		print "Error I have been given an invalid date";
		die "Error I have been given an invalid date ($date)";
	}
}

# param should only have the following characters in them [a-zA-Z\d\_\- \.]
sub check_param($) {
	my $param = shift;

	if ( $param =~ /\.\./ ) {
		print "I have been given an invalid parameter";
		die "I have been given an invalid parameter ($param)";
	}
	if ( $param =~ /[^a-zA-Z\d\_\- \.\,\*\?\(\)\t\n\r\/\:]/ ) {
		print "I have been given an invalid parameter";
		die "I have been given an invalid parameter ($param)";
	}
}

sub add_external_references($) {
	my $text = shift;

	# Ticket [ 2783579 ] - Characters missing from URL
	# Added @ and " as valid URL characters
	$text =~ s/(https?\:\/\/[a-zA-Z0-9\.\/\&\?\%\-\_\=\#\;\:\|\"\@]+)/<a target = \'_blank\' href=\'$1\'>$1<\/a>/g;
	$text =~ s/\s+(www\.[a-zA-Z0-9\.\/\&\?\%\-\_\=\#]+)/ <a target = \'_blank\' href=\'http\:\/\/$1\'>$1<\/a>/g;
	# Ticket [ ] - Nikto integration
	$text =~ s/(CA\-\d{4}\-\d{2})/<a target=\'_blank\' href=\'http:\/\/www.cert.org\/advisories\/$1.html\'>$1<\/a>/g;
	# Ticket [ 2793178 ] - Odd rendering of CVE references
	# CVE references will only be updated if not preceeded with a = sign.
	$text =~ s/([^=])((CVE|CAN)\-\d{4}\-\d{4})/$1<a target=\'_blank\' href=\'http:\/\/cve.mitre.org\/cgi-bin\/cvename.cgi?name=$2\'>$2<\/a>/g;
	$text =~ s/(OSVDB[\:\-](\d+))/<a target=\'_blank\' href=\'http:\/\/osvdb.org\/displayvuln.php?osvdb_id=$2\'>$1<\/a>/g;
	# Ticket [ 3085944 ] - CWE: references not hyperlinked
	$text =~ s/(CWE\:(\d+))/<a target=\'_blank\' href=\'http:\/\/cwe.mitre.org\/data\/definitions\/$2.html\'>$1<\/a>/g;
	# Ticket [ 2986061 ] - Odd rendering of MS bulleting links
	# Only render MS type text into a hyperlink if it is not preceeded by a 
	# slash.
	$text =~ s/([^\/])(MS(\d+\-\d+))/$1<a target=\'_blank\' href=\'http\:\/\/www.microsoft.com\/technet\/security\/Bulletin\/MS$3.mspx\'>$2<\/a>/g;
	$text =~ s/(RFP[\-\s]?(\d+))/<a target=\'_blank\' href=\'http\:\/\/www.wiretrip.net\/rfp\/txt\/rfp$2.txt\'>$1<\/a>/g;
	$text =~ s/(GLSA[\:\-](\d+\-\d+))/<a target=\'_blank\' href=\'http:\/\/www.gentoo.org\/security\/en\/glsa\/glsa\-$2\.xml\'>$1<\/a>/g;
	# BUG [ 2088990 ] Secunia references not translated to a URL
	$text =~ s/(Secunia[\:\-](\d+))/<a target=\'_blank\' href=\'http:\/\/secunia.com\/advisories\/$2\/'>$1<\/a>/g;
	$text =~ s/(milw0rm[\:\-](\d+))/<a target=\'_blank\' href=\'http:\/\/www.milw0rm.com\/exploits\/$2'>$1<\/a>/g;
	# BUG [ 2088990 ] ---- END
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID\s+\:\s+\d+\, )(\d+)/$1 BID : $2/g;
	$text =~ s/(BID(\s+\:\s+|\-)(\d+))/<a target=\'_blank\' href=\'http:\/\/www.securityfocus.com\/bid\/$3\'>$1<\/a>/g;
	$text =~ s/(OWASP-[A-Z]+-\d+)/<a target=\'_blank\' href=\'http:\/\/sourceforge.net\/project\/downloading.php?groupname=owasp&filename=OWASPWebAppPenTestList1.1.pdf>$1<\/a>/g;
	$text =~ s/(\(CVSS2\#(.*?)\))/<a target=\'_blank\' href=\'http\:\/\/jvnrss.ise.chuo-u.ac.jp\/jtg\/cvss\/cvss2.cgi\?name=Seccubus calculation&vector=($2)&g=4&lang=en'>$1<\/a>/g;
	return $text;
}

sub get_var() {
	return $VAR;
}

sub get_etc() {
	return $ETC;
}

sub get_stati() {
	return @stati;
}

sub get_hostnames($) {
	my $scan = shift;

	my (
		$line,
		%names,
	   );

	if ( open HOSTFILE, "$VAR/$scan/hostnames") {
		while(<HOSTFILE>) {
			chomp;
			if ( /^(.*?)\s+(\S*).*$/ ) {
				$names{$1} = $2;
			}
		}
	}
	return %names;
}

sub check_permission($;$) {
	my $scan = shift;
	my $noexit = shift;

	my $user = $ENV{REMOTE_USER};
	my (
		$line,
		@lines,
	   );
	# Check if an allow file exists and disallow access if the user
	# is not in the file
	if ( -e "$VAR/$scan/.allow" ) {
		open(FILE, "$VAR/$scan/.allow") or die "unable to open .allow";
		@lines = <FILE> ;
		$line = shift @lines;
		chomp ($line);
		while ( $line && $line ne $user ) {
			$line = shift @lines;
			chomp ($line);
		}
		if ( ! $line ) {
			if ( $noexit ) {
				return 0;
			} else {
				print 'Permission denied';
				exit;
			}
		}
		close(FILE);
	}
	# Check if an .deny file exists and disallow access if the user
	# is in the file
	if ( -e "$VAR/$scan/.deny" ) {
		open(FILE, "$VAR/$scan/.deny") or die "unable to open .deny";
		while ( <FILE> ) {
			chomp;
			if ( $_ eq $user ) {
				if ( $noexit ) {
					return 0;
				} else {
					print 'Permission denied';
					exit;
				}
			}
		close(FILE);
		}
	}
	return 1;
}

sub count_function($) {
	my $findings = shift;
	my %findings = %{$findings};

	my (
		%count,
		$status,
	   );
	
	$count{'NEW'} = 0;
	$count{'CHANGED'} = 0;
	$count{'OPEN'} = 0;
	$count{'GONE'} = 0;
	$count{'NO ISSUE'} = 0;
	$count{'FIXED'} = 0;
	$count{'HARD MASKED'} = 0;

	foreach $status ( keys %findings ) {
		if ( $status =~ /^STATUS_(.*)/ ) {
			$count{$1} = @{$findings{"STATUS_$1"}};
		}
	}

	print "<span class='hidden' id='_numNew'>$count{'NEW'}</span>\n";
	print "<span class='hidden' id='_numChanged'>$count{'CHANGED'}</span>\n";
	print "<span class='hidden' id='_numOpen'>$count{'OPEN'}</span>\n";
	print "<span class='hidden' id='_numGone'>$count{'GONE'}</span>\n";
	print "<span class='hidden' id='_numNoIssue'>$count{'NO ISSUE'}</span>\n";
	print "<span class='hidden' id='_numFixed'>$count{'FIXED'}</span>\n";
	print "<span class='hidden' id='_numHardMasked'>$count{'HARD MASKED'}</span>\n";
}

return 1;
