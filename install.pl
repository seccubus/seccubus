#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: install.pl,v 1.10 2010/07/06 13:53:36 pslootweg Exp $
# ------------------------------------------------------------------------------
# Thist perl script builds the distributions from the sources
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------


use strict;
use Getopt::Long;

sub syst($) {
        my $cmd = shift;

	print "$cmd\n";
	system "$cmd";
}


my (
	$file,
	@BINFILES,
	@WWWFILES,
	@CHANGE_FILES,
   );


@BINFILES = qw (
		EveryXXXWeek.sh
		EveryXXXday.sh
		do-scan
		process-scan.pl
		update-nessusrc
		update-plugin-info
		update-plugin-info.pl
		update-rcs
               );
@WWWFILES = qw (
		SeccubusWeb.pm
		bulk_update.pl
		editHostfile.pl
		favicon.ico
		getFilter.pl
		getFindings.pl
		getScanInfo.pl
		getScans.pl
		get_report.pl
		getHelp.pl
		index.html
		nessus.xsl
		view_finding.pl
		writeHostfile.pl
		up2date.pl
	       );

my $bash = "/bin/bash";
my $buildroot = "";
my ( $bindir, $etcdir, $vardir, $wwwdir );

GetOptions(
	'bash=s', \$bash,
	'buildroot=s', \$buildroot,
	'bin=s',  \$bindir,
	'etc=s',  \$etcdir,
	'var=s',  \$vardir,
	'www=s',  \$wwwdir,
);

my $target = '/home/seccubus';
my $opt_target = shift;

$target = $opt_target if $opt_target;

$bindir = "$target/bin" unless ( $bindir );
$etcdir = "$target/etc" unless ( $etcdir );
$vardir = "$target/var" unless ( $vardir );
$wwwdir = "$target/www" unless ( $wwwdir );

my $err = 0;
$err = 1 if ( ! $bindir || ! $etcdir || ! $vardir || ! $wwwdir );
$err = 0 if ( $err && $target );


# buildroot option is only for packagers
sub usage() {
	die "
		Usage: perl install.pl [--bash=/bin/bash] [install target]

		Install target could e.g. be /home/seccubus. The installer will install
		everything in this directory, unless overriden with the following options:

		--bash 		Specifies the location of bash  (default /bin/bash)
		--bin		Specifies the location of the bin dir (default <target>/bin)
		--etc		Specifies the location of the etc dir (default <target>/etc)
		--var		Specifies the location of the var dir (default <target>/var)
		--www		Specifies the location of the www dir (default <target>/www)
	    ";
}

usage() if $err;

if ( $buildroot && ! -d "$buildroot/$target" ) {
	print "Creating build directory\n";
	system "mkdir -p $buildroot/$target";
}
if ( ! -d "$buildroot/$bindir" ) {
	print "Creating bin directory\n";
	system "mkdir -p $buildroot/$bindir";
}
die "Unable to create \'$buildroot/$bindir\'" unless -d "$buildroot/$bindir";
foreach $file ( @BINFILES ) {
	syst "cp blib/script/$file $buildroot/$bindir";
	if ( $bash ne "/bin/bash" ) {
		syst "cat $buildroot/$bindir/$file | sed 's:/bin/bash:$bash:' > $buildroot/$bindir/$file";
		syst "chmod 755 $buildroot/$bindir/$file";
	}
}

if ( ! -d "$buildroot/$wwwdir" ) {
	print "Creating www directory\n";
	syst "mkdir -p $buildroot/$wwwdir";
}
die "Unable to create \'$buildroot/$wwwdir\'" unless -d "$buildroot/$wwwdir";
foreach $file ( @WWWFILES ) {
	syst "cp blib/script/$file $buildroot/$wwwdir";
}

syst "cp -r www/style www/js $buildroot/$wwwdir";

if ( ! -d "$buildroot/$etcdir" ) {
	print "Creating etc directory\n";
	system "mkdir -p $buildroot/$etcdir";
}
die "Unable to create \'$buildroot/$etcdir\'" unless -d "$buildroot/$etcdir";
syst "cp -r etc/* $buildroot/$etcdir";

if ( ! -d "$buildroot/$vardir" ) {
	print "Creating var directory\n";
	system "mkdir -p $buildroot/$vardir";
}
die "Unable to create \'$buildroot/$vardir\'" unless -d "$buildroot/$vardir";
syst "cp -r var/.skel $buildroot/$vardir";
if ( ! -d "$buildroot/$vardir/.plugins" ) {
	print "Creating var/.plugins directory\n";
	system "mkdir -p $buildroot/$vardir/.plugins";
}
die "Unable to create \'$buildroot/$vardir/.plugins\'" unless -d "$buildroot/$vardir/.plugins";
syst "touch $buildroot/$vardir/.plugins/.keep";

my @CHANGE_FILES = (
	"$etcdir/config.dist",
	"$etcdir/crontab.example",
	"$wwwdir/SeccubusWeb.pm",
	"$bindir/update-plugin-info",
	"$bindir/update-rcs",
	"$bindir/update-nessusrc",
	"$bindir/do-scan",
	"$bindir/update-plugin-info",
);

for my $file (@CHANGE_FILES) {
	syst "mv $buildroot/$file $buildroot/$file.orig";
	syst "sed -e \'s:/home/seccubus:$target:g\' -e \'s:/home/seccubus/var:$vardir:g\' -e \'s:/home/seccubus/bin:$bindir:g\' -e \'s:/home/seccubus/etc:$etcdir:g\' $buildroot/$file.orig > $buildroot/$file";
	syst "rm $buildroot/$file.orig";
	syst "chmod 755 $buildroot/$file";
}

if ( ! -e "$buildroot/$etcdir/config" ) {
	print "You do not have a config file please copy config.dist to config, and edit it to match your system\n";
}
print "\nInstallation finished\nPlease make sure you read INSTALL.txt to finalize the setup\n";

