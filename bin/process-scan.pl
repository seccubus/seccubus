#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: process-scan.pl,v 1.19 2010/07/05 12:17:04 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# This perl script takes the last nessus output and storts it in the flat file 
# database. It will also do some logased on the status and the previous nessus
# output. ANd mail a short report.
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use Algorithm::Diff qw( diff );

my $DEBUG = 0;

my (
	$scan,
	$email,
	@files,
	$thisscan,
	@hosts,
	$host,
	$report,
	$diff,
   );

# Get command line parameters
$scan = shift or die "No scan specified";
$email = shift;

# Check for sendmail
$ENV{SENDMAIL} = "sendmail" unless $ENV{SENDMAIL};

# Find the latest *.nbe file
@files = sort <output/*.nbe>;
$files[-1] =~ /(\d+)\.nbe$/;
$thisscan = $1;

# Store the findings from the nbe file in the flat file database
store_nbe_in_tree($thisscan);

# Enumberat all hosts and process them.
@hosts = <findings/*>;
foreach $host (@hosts) {
	$host =~ s/^findings\///;
	process_host($host, $thisscan, \$report);
}	

# Print the report to stdout and mail it.
print "$report\n";
open (OUT, ">output/$thisscan.rpt") or die "Unable to write report";
print OUT $report;
close OUT;
# ticket [ 2783580 ] - Missing EMAIL= not handled gracefully
# No email will be sent without email address
if ( $email ) {
	open (MAIL, "|$ENV{SENDMAIL} -t ") or die "Unable to open mail pipe";
	print MAIL "From: Seccubus\nTo: $email\nContent-Type: text/plain\n";
	print MAIL "Subject: Seccubus output for $scan\n";
	print MAIL $report;
	close MAIL;
}
exit;

# ------------------------------------------------------------------------------
# This subroutine checks the findings for a host and processes the status
# changes
# ------------------------------------------------------------------------------
sub process_host($$$:) {
	my $host = shift;
	my $scan = shift;
	my $report = shift;

	# find out if this host has been scanned before
	my (
		%find_count,
		$find_report,
		@scans,
	   );

	@scans = <findings/$host/scan_*>;

	if ( $scans[-1] eq "findings/$host/scan_$scan" ) {
		if ( @scans == 1 ) {
			$find_report = "Status: *** WARNING *** Newly discovered\n";
		}
		if ( -e "findings/$host/dead" ) {
			unlink  "findings/$host/dead";
			$find_report = "*** ALERT ***: Dead host reappeared in scan!!!\n";
		}
	} else {
		if ( ! -e "findings/$host/dead" ) {
			$find_report = "*** Warning *** previously discovered host not found\n"; 
			open (DEAD, ">findings/$host/dead" ) or die "Unable to open findings/$host/dead";
			close DEAD;
		}
	}

	# Get all findings for this host and process them
	my @findings = <findings/$host/*/*>;
	for my $finding (@findings ) {
		$finding =~ s/findings\/$host\///;
		print "$finding\t" if $DEBUG;
		my $status = process_finding($finding, $host, $scan, \$find_report);
		$find_count{$status}++;
		print "$status\n" if $DEBUG;
	}
	# Report all findigns that are not FIXED, NO ISSUE or HARD MASKED
	foreach my $key (sort keys %find_count) {
		if ( $key !~ /(FIXED|NO ISSUE|HARD MASKED)/ ) {
			$find_report .= "$key\t$find_count{$key}\n";
		}
	}
	if ( $find_report ) {
		$$report .= "Host $host\n";
		$$report .= "====================\n";
		$scans[-2] =~ /(\d+)$/;
		$$report .= "Previous scan: $1\n" if $1;
		$$report .= $find_report;
		$$report .= "\n\n";
	}
}

sub process_finding($$$$:) {
	my $finding = shift;
	my $host = shift;
	my $scan = shift;
	my $report = shift;

	print "$finding->" if $DEBUG;

	my (
		$current,
		$previous,
		@fields,
	   );

	my $status = "NEW";

	# Get the current finding for this finding
	if ( -e "findings/$host/$finding/status" ) {
		open STATUS, "findings/$host/$finding/status" or die "Unable to open findings/$host/$finding/status";
		$status = <STATUS>;
		chomp $status;
		close STATUS;
	}
	my $old_status = $status;

	# Get list of findings over time
	my @scans = sort <findings/$host/$finding/2*>;

	# BUG [ 2521076 ]
	# If scans are deleted manually you sometimes have no findings in the
	# directory
	if ( @scans == 0 ) {
		$status = "GONE" unless $status eq "FIXED" or $status eq "HARD MASKED";
	} else {

		# Read the fields for the current finding
		open (FIND, $scans[-1]) or die "Unable to open finding '$host/$finding' '$scans[-1]' '" . join ("|", @scans) . "'";
		# Ticket [ 2978649 ] - Seccubus cannot handle compliance plugin output
		$current = join "", <FIND>;
		@fields = split /\|/, $current;
		close FIND;
		
		# If the last recorded scan is the current scan
		if ( $scans[-1] eq "findings/$host/$finding/$scan" ) {
			# If there is only one scan, this is a new finding
			if ( @scans == 1 ) {
				# Dead hosts don't interest us untill they 
				# come alive.
				if ( $finding =~ /\/10180/ ) {
					if ( $current =~ /considered as dead/ ) {
						$status = "NO ISSUE";
					}
				# Don't care about traceroute
				} elsif ( $finding =~ /\/(12264|10287)/ ) {
					$status = "HARD MASKED";
				# Don't care about nessus status
				} elsif ( $finding =~ /\/19506/ ) {
					$status = "HARD MASKED";
				}
			} else {
				if ( $status eq "FIXED" || $status eq "GONE" ) {
					# A findings that reappears after is 
					# was marked FIXED or GONE reopens
					$$report .= "Finding $finding, $fields[3], $fields[5] was $status  but found again, reopened\n";
					$status = "NEW"; # See bug 1998001 
				} elsif ( $status eq "NO ISSUE" || $status eq "OPEN" ) {
					# If a finding was marked NO ISSUE we 
					# will have to diff them.
					open (FIND, $scans[-2]) or die "Unable to open finding";
					$previous = <FIND>;
					close FIND;
					$diff = diffit($previous, $current);
					# If there are still differences we will
					# reopen the finding
       	         		if ( $diff ) {
						$$report .= "Finding $finding, $fields[3], $fields[5] reopened, was $status but changed\n";	
						$$report .= "Diff: \|$diff\|\n";
						$status = "CHANGED";
       		         		}
				} elsif ( $status eq "NEW"  ) {
					# If a new findings is found more then 
					# once it is not new anymore.
					#if ( @scans > 1 ) {
					#	$status = "OPEN";
					#}
					# This was wrong behavious as per bug 1998001 
				} elsif ( $status =~ /HARD MASKED/ || $status eq "CHANGED" ) {
					# Ignore HARD MASKED and CHANGED 
					# findings. 
				} else {
					# Oh sh*t we have encountered an 
					# unexpected status
					die "findings/$host/$finding/$scan, unknown status: $status";
				}
			}
		} else {
			# If the last scan is not latest scan it must be either
			# gone Set this status if the finding was previously 
			# marked as OPEN, NO ISSUE or NEW.
			if ( $status =~ /OPEN|NO ISSUE|NEW/ ) {
				$status = "GONE"
			}
		}
	}
	
	# Lets do some autoprocessing to make life easier
	autoupdate_remark($finding, $host, $current, $report);
	if ( $status ne $old_status ) {
		update_remark($finding, $host, "Status changed from $old_status to $status");
	}

	print "$finding\t" if $DEBUG;
	
	# Write the status to file and return it to the caller.
	open STATUS, ">findings/$host/$finding/status" or die "Unable to open findings/$host/$finding/status";
	print STATUS $status;
	close STATUS;
	return "$status\t$fields[5]";
}

# ------------------------------------------------------------------------------
# This routine stores the records in an NBE file in the flatfile database
# ------------------------------------------------------------------------------
sub store_nbe_in_tree($:) {
	my $scan = shift;

	my $port;

	open (NBE, "output/$scan.nbe") or die "Unable to open NBE file";

	while (<NBE> ) {
		# Split the fileds in the record
		chomp;
		$_ =~ s/^\"//;
		$_ =~ s/\"$//;
		$_ =~ s/\"\|/\|/g;
		$_ =~ s/\|\"/\|/g;
		my @fields = split /\|/, $_;

		if ( $fields[0] eq "timestamps" ) {
			# Ignore timestamps 
		} elsif ( $fields[0] eq "results" ) {
			# BUG [ 2316867 ] OpenVas uses upper case as well
			$fields[3] =~ /(((\d+|general)\/\w+)|(^\d+$))/;
			$port = $1;
			$port =~ s/\//_/;
			# Findings with 4 fields are open ports
			# The actual finding is the open port so we will
			# apeend it as field [4] and replace the / with a _ for
			# the sake of the fhe filesystem
			if ( @fields == 4 ) {
				push @fields, "Portscanner";
				push @fields, "Open port";
				push @fields, "Port $fields[3] is open";
				$_ .= "|$port|Open port|Port $fields[3] is open";
			} else {
				# BUG [ 2316867 ] OpenVas prepends 
				# 1.3.6.1.4.1.25623.1.0. to every plugin. 
				# While probably correct, it looks sloppy
				$fields[4] =~ s/^1\.3\.6\.1\.4\.1\.25623\.1\.0\.//;
				# Ticket [ 2978649 ] - Seccubus cannot handle
				# compliance plugin output
				# If the plugin is one of the compliancy
				# then append the first word (sequence of non-
				# space characters) to the plugin
				if ( $fields[4] =~ /^(33814|21157|21156|24760)$/ ) {
					$fields[6] =~ /^\"?(\S+)/;
					$fields[4] .= "_$1";
				}
			}
			die "Not enough fields : $_"  unless $fields[4];
			add_finding($scan,$fields[2],$port,$fields[4],$_);
		} else {
			die "Unknown field type $fields[0]";
		}
	}
	close (NBE);
}

# ------------------------------------------------------------------------------
# This routine stores the actual finding in the flatfile database
# ------------------------------------------------------------------------------
sub add_finding($$$$:) {
	my $scan = shift;
	my $host = shift;
	my $port = shift;
	my $plugin = shift;
	my $output = shift;

	die "Not plugin specified" unless $plugin;

	if ( ! -d "findings/$host" ) {
		print "Need to create dir for $host\n" if $DEBUG;
		mkdir "findings/$host";
	}
	if ( ! -d "findings/$host/$port" ) {
		print "Need to create dir for $host/$port\n" if $DEBUG;
		mkdir "findings/$host/$port";
	}
	open FIND, ">findings/$host/scan_$scan" or die "Unable to mark host";
	close FIND;
	if ( ! -d "findings/$host/$port/$plugin" ) {
		print "Need to create dir for plugin $plugin on host $host port $port\n" if $DEBUG;
		mkdir "findings/$host/$port/$plugin";
	}
	# Ticket [ 2978649 ] - Seccubus cannot handle compliance plugin output
	if ( -e "findings/$host/$port/$plugin/$scan" ) {
		$output =~ /^.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|(.*)$/;
		$output = $1;
	}
	open FIND, ">>findings/$host/$port/$plugin/$scan" or die "Unable to create finding $plugin for host $host port $port";
	print FIND "$output\n";
	print "$output\n" if $DEBUG;
	close FIND;
}


sub diffit($$:) {
	my $previous = shift;
	my $current = shift;

	print "Diffit: \n$previous\n$current\n" if $DEBUG;

	my ( 
		@previous,
		@current,
		@diff,
		@ignore,
		$diff,
		$diff2,
	   );

	if ( $previous ne $current ) {
		@previous = split /(\||\\n)/, $previous;
		@current = split /(\||\\n)/, $current;
		@diff = diff(\@previous, \@current);
		open (IGNORE, "$ENV{CONFIG}/ignore_diffs" ) or die "Unable to open diff prefs file";
		foreach ( <IGNORE> ) {
			chomp;
			push @ignore, $_;
		}
		close IGNORE;
		foreach ( @diff ) {
			foreach ( @$_ ) {
				$diff .= join " ", @$_;
				$diff .= "\n";
			}
		}
		undef @diff;
		foreach ( split /\n/, $diff ) {
			$diff2 = $_;
			foreach ( @ignore ) {
				my $pattern = $_;
				if ( $diff2 =~ /$pattern/ ) {
					undef $diff2;
					last;
				} else {
					print "\'$diff2\'\n\'$pattern\'\n" if $DEBUG;
				}
			}
			if ( $diff2 ) {
				push @diff, $diff2;
			}
		}
		return join "\n", @diff;
	} else {
		return;
	}
}

# autmatically update the remark based on the contents of the finding
sub autoupdate_remark($$$$;) {
	my $finding = shift;
	my $host = shift;
	my $text = shift;
	my $report = shift;

	my (
		$remark,
		$findno,
		$pattern,
		$add_text,
	   );
	
	# Get the current finding for this finding
	if ( -e "findings/$host/$finding/remark" ) {
		open REMARK, "findings/$host/$finding/remark" or die "Unable to open findings/$host/$finding/remark";
		# BUG [ 2152839 ] Comment add seems to overwrite
		#$remark = <REMARK>;
		$remark = join("", <REMARK>);
		close REMARK;
	}

	open(PATTERNS, "$ENV{CONFIG}/autoremark") or
		die "unable to open $ENV{CONFIG}/autoremark";

	while ( <PATTERNS> ) {
		chomp;
		s/#.*//; #Remove comments
		($findno, $pattern, $add_text) = split /\t+/, $_;

		if ( $pattern ) {
			# If the finding numbers correspond
			if ( $finding =~ /\/$findno/ ) {
				# Deal with negated patterns
				if ( $pattern =~ /^\!/ ) {
					$pattern =~ s/^\!//;
					# Check if the is not present
					if ( $text !~ /$pattern/ ) {
					# Update the remark if is has not been done before
						# BUG [ 1996755 ] AutoRemark does not correctly check if comment allready pres
						#if ( $remark !~ /$add_text/ ) {
						# BUG [ 2392801 ] AutoRemark does not proppery check if comment alrdy presetn
						# unless ( index($remark, $add_text) ) {
						if ( index($remark, $add_text) == -1 ) {
							$remark = join("\n", $remark, $add_text);
							$$report .= "Added: \'$add_text\' to remark\n";
	
						}
					}
				} else {
					# Check if the pattern matches
					if ( $text =~ /$pattern/ ) {
						# Update the remark if is has not been done before
						# BUG [ 1996755 ] AutoRemark does not correctly check if comment allready pres
						# if ( $remark !~ /$add_text/ ) {
						# BUG [ 2392801 ] AutoRemark does not proppery check if comment alrdy presetn
						# unless ( index($remark, $add_text) ) {
						if ( index($remark, $add_text) == -1 ) {
							$remark = join("\n", $remark, $add_text);
							$$report .= "Added: \'$add_text\' to remark\n";
						}
					}
				}
			}
		}
	}
	close PATTERNS;
	open REMARK, ">findings/$host/$finding/remark" or die "Unable to open findings/$host/$finding/remark for writing";
	print REMARK $remark;
	close REMARK;
}

# UPdate the remark of a finding
sub update_remark($$$;) {
	my $finding = shift;
	my $host = shift;
	my $text = shift;

	my ( 
		$remark,
	   );

	my ($sec, $min, $hour, $day, $month, $year) = localtime();
	my $date = sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $month+1,$day, $hour, $min, $sec); 

	# Get the current finding for this finding
	if ( -e "findings/$host/$finding/remark" ) {
		open REMARK, "findings/$host/$finding/remark" or die "Unable to open findings/$host/$finding/remark";
		# BUG [ 2152839 ] Comment add seems to overwrite
		#$remark = <REMARK>;
		$remark = join("", <REMARK>);
		close REMARK;
	}

	# BUG [ 2407614 ] - Add_remark broken
	# Changed "$date - text" to "$date - $text" in add_remark function in
	# process_scan.pl
	#
	# $remark = join("\n", $remark, "$date - text");
	$remark = join("\n", $remark, "$date - $text");

	open REMARK, ">findings/$host/$finding/remark" or die "Unable to open findings/$host/$finding/remark";
	print REMARK $remark;
	close REMARK;
}
