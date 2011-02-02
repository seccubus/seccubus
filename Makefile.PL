# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------
use ExtUtils::MakeMaker;
WriteMakefile (
	NAME		=> "Seccubus",
	#VERSION		=> "1.1",
	VERSION_FROM	=> "www/SeccubusWeb.pm",
	# BUG [ 2130297 ] Make the scan list also show the version of Seccubus
	# This ment moving the version to SeccubusWeb.pm so it can be loaded 
	# from getScans.pl
	PREREQ_PM	=> {
				Algorithm::Diff		=> 1.15,
				Carp			=> 1.04,
                                CGI                     => 3.15,
                                Exporter                => 5.58,
				ExtUtils::MakeMaker	=> 6.30,
				Getopt::Long		=> 2.35,
				IPC::Open2		=> 1.02,
				# BUG [ 2042667 ] MIssing prereq perl modules
				LWP::UserAgent		=> 2.0,
				LWP			=> 2.0,
				Getopt::Long		=> 0.0,
			},
	EXE_FILES	=> [ qw ( 
				install.pl
				bin/do-scan
				bin/process-scan.pl
				bin/EveryXXXday.sh
				bin/EveryXXXWeek.sh
				bin/update-nessusrc
				bin/update-rcs
				bin/update-plugin-info
				bin/update-plugin-info.pl
				www/SeccubusWeb.pm
				www/bulk_update.pl
				www/editHostfile.pl
				www/favicon.ico
				www/getHelp.pl
				www/getFilter.pl
				www/getFindings.pl
				www/getScanInfo.pl
				www/getScans.pl
				www/get_report.pl
				www/index.html
				www/nessus.xsl
				www/view_finding.pl
				www/writeHostfile.pl
				www/up2date.pl
			   ) ],
);

package MY;
sub install {
	return "install :: all
			echo \"Please run blib/script/install.pl to install\"";
}
