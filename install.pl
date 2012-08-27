<<<<<<< HEAD
#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Seccubus installation script
# ------------------------------------------------------------------------------
=======
#!/usr/bin/perl
# ------------------------------------------------------------------------------
# $Id: install.pl,v 1.10 2010/07/06 13:53:36 pslootweg Exp $
# ------------------------------------------------------------------------------
# Thist perl script builds the distributions from the sources
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

>>>>>>> f01fefbeef51848e21c272957425e7cd92ce8a78

use strict;
use Getopt::Long;

<<<<<<< HEAD
sub syst($);
sub help(;$);

my ( 
	$base_dir,
	$www_dir,
	$bin_dir,
	$mod_dir,
	$scan_dir,
	$conf_dir,
	$db_dir,
	$doc_dir,
	$stage_dir,
	$stageonly,
	$build_root,
	$create_dirs,
	$owner,
	$wwwowner,
	$help,
	$verbose,
	$quiet,
   );

my @files = qw(
		SeccubusV2.pm
	      );
my @dirs = qw(
	     	SeccubusV2
		bin
		db
		docs
		etc
		scanners
		www
	     );

# Ticket #62 - Default locations for config.xml does not include
# /home/seccubus/etc/config.xml
my @patches = qw(
			SeccubusV2.pm
			etc/config.xml.mysql.example
			www/json/ConfigTest.pl
		);

$base_dir = "/home/seccubus";
$stage_dir = "/tmp/SeccubusV2.stage.$$";
$help = 0;

GetOptions(	'basedir|b=s'	=> \$base_dir,
		'wwwdir|w=s'	=> \$www_dir,
		'bindir=s'	=> \$bin_dir,
		'moddir|m=s'	=> \$mod_dir,
		'scandir|s=s'	=> \$scan_dir,
		'confdir|c=s'	=> \$conf_dir,
		'dbdir|d=s'	=> \$db_dir,
		'docdir=s'	=> \$doc_dir,
		'owner|o=s'	=> \$owner,
		'wwwowner|o=s'	=> \$wwwowner,
		'stage_dir=s'	=> \$stage_dir,
		'stageonly'	=> \$stageonly,
		'buildroot=s'	=> \$build_root,
		'createdirs'	=> \$create_dirs,
		'help|h!'	=> \$help,
		'verbose|v+'	=> \$verbose,
		'quiet|q!'	=> \$quiet,
	  );

$verbose++;
$verbose = 0 if $quiet;
$www_dir = "$base_dir/www" unless $www_dir;
$bin_dir = "$base_dir/bin" unless $bin_dir;
$mod_dir = "$base_dir/SeccubusV2" unless $mod_dir;
$scan_dir = "$base_dir/scanners" unless $scan_dir;
$conf_dir = "$base_dir/etc" unless $conf_dir;
$db_dir = "$base_dir/db" unless $db_dir;
$doc_dir = "$base_dir/docs" unless $doc_dir;
$wwwowner = $owner unless $wwwowner;
if ( $build_root && ! $build_root =~ /\/$/ ) {
	$build_root .= "/";
}

if ( $help ) {
	help();
} 

# Check if we have a stage root
print "Checking to see if target paths exists or created\n" if $verbose;
if ( -d "$stage_dir" ) {
	print "Stage directory '$stage_dir' exists\n" if $verbose;
} else {
	print "Creating stage directory '$stage_dir'\n" if $verbose;
	syst("mkdir -p '$stage_dir'");
}

# Copy files to stage_dir
print "Copying files to stage_dir\n" if $verbose;
foreach my $file ( @files ) {
	syst("cp $file $stage_dir");
}
print "Copying directories to stage_dir\n" if $verbose;
foreach my $dir ( @dirs ) {
	syst("cp -r $dir $stage_dir");
}

print "Patching file paths\n" if $verbose;
foreach my $file ( @patches ) {
	$file = "$stage_dir/$file";
	syst("sed -i 's:/opt/Seccubus/SeccubusV2:$mod_dir:' $file");
	syst("sed -i 's:/opt/Seccubus/scanners:$scan_dir:' $file");
	syst("sed -i 's:/opt/Seccubus/bin:$bin_dir:' $file");
	syst("sed -i 's:/opt/Seccubus/etc:$conf_dir:' $file");
	syst("sed -i 's:/opt/Seccubus/db:$db_dir:' $file");
}

print "Changing file ownership\n" if $verbose && ( $owner || $wwwowner );
syst("chown -R $owner $stage_dir") if $owner;
syst("chown -R $wwwowner $stage_dir/www") if $wwwowner;

# Quit if stageonly
exit if $stageonly;

# Check to see if paths need to be created
if ( -d "$build_root$base_dir" ) {
	print "Basedir '$build_root$base_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs ) {
		print "Creating basedir '$build_root$base_dir'\n" if $verbose;
		syst("mkdir -p '$build_root$base_dir'");
		syst("chown $owner $build_root$base_dir") if $owner;
	} else {
		help("Basedir '$build_root$base_dir' does not exist");
	}
}

if ( -d "$build_root$www_dir" ) {
	print "Wwwdir '$build_root$www_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $www_dir,$base_dir == 0 ) {
		print "Creating wwwdir '$build_root$www_dir'\n" if $verbose;
		syst("mkdir -p '$build_root$www_dir'");
		syst("chown $wwwowner $build_root$www_dir") if $wwwowner;
	} else {
		help("Wwwdir '$build_root$www_dir' does not exist");
	}
}
if ( -d "$build_root$bin_dir" ) {
	print "Bindir '$build_root$bin_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $bin_dir,$base_dir == 0 ) {
		print "Creating wwwdir '$build_root$bin_dir'\n" if $verbose;
		syst("mkdir -p '$build_root$bin_dir'");
		syst("chown $owner $build_root$bin_dir") if $owner;
	} else {
		help("Bindir '$build_root$bin_dir' does not exist");
	}
}

if ( -d "$build_root$mod_dir" ) {
	print "Moddir '$build_root$mod_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $mod_dir,$base_dir == 0 ) {
		print "Creating moddir '$build_root$mod_dir'\n" if $verbose;
		syst("mkdir -p '$build_root$mod_dir'");
		syst("chown $owner $build_root$mod_dir") if $owner;
	} else {
		help("Moddir '$build_root$mod_dir' does not exist");
	}
}

if ( -d "$build_root$scan_dir" ) {
	print "Scandir '$build_root$scan_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $scan_dir, $base_dir == 0 ) {
		print "Creating scandir '$build_root$scan_dir'\n" if $verbose;
		syst("mkdir -p '$build_root$scan_dir'");
		syst("chown $owner $build_root$scan_dir") if $owner;
	} else {
		help("Scandir '$build_root$scan_dir' does not exist");
	}
}

if ( -d "$build_root$conf_dir" ) {
	print "Confdir '$build_root$conf_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $conf_dir, $base_dir == 0 ) {
		print "Creating confdir '$build_root$conf_dir'\n" if $verbose;
		syst("mkdir -p '$build_root$conf_dir'");
		syst("chown $owner $build_root$conf_dir") if $owner;
	} else {
		help("Confdir '$build_root$conf_dir' does not exist");
	}
}

if ( -d "$build_root$db_dir" ) {
	print "Dbdir '$build_root$db_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $db_dir, $base_dir == 0 ) {
		print "Creating dbdir '$build_root$db_dir'\n" if $verbose;
		syst("mkdir -p '$build_root$db_dir'");
		syst("chown $owner $build_root$db_dir") if $owner;
	} else {
		help("Dbdir '$build_root$db_dir' does not exist");
	}
}

if ( -d "$build_root$doc_dir" ) {
	print "Docdir '$build_root$doc_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $doc_dir, $base_dir == 0 ) {
		print "Creating docdir '$build_root$doc_dir'\n" if $verbose;
		syst("mkdir -p '$build_root$doc_dir'");
		syst("chown $owner $build_root$doc_dir") if $owner;
	} else {
		help("Docdir '$build_root$doc_dir' does not exist");
	}
} 

# Moving files
print "Copying files and directories" if $verbose;
foreach my $file ( @files ) {
	syst("cp -p $stage_dir/$file $build_root$base_dir");
}
syst("cp -p -r $stage_dir/www/* $build_root$www_dir");
syst("cp -p -r $stage_dir/bin/* $build_root$bin_dir");
syst("cp -p -r $stage_dir/SeccubusV2/* $build_root$mod_dir");
syst("cp -p -r $stage_dir/scanners/* $build_root$scan_dir");
syst("cp -p -r $stage_dir/etc/* $build_root$conf_dir");
syst("cp -p -r $stage_dir/db/* $build_root$db_dir");
syst("cp -p -r $stage_dir/docs/* $build_root$doc_dir");

# Link SeccubusV2.pm and api in www_dir
print "Creating symbolic links to SeccubusV2.pm in wwwdir/seccubus\n" if $verbose;
syst("cd $build_root$www_dir/seccubus;ln -s $base_dir/SeccubusV2.pm");

# Clean up stage root
print "Cleaning up...\n" if $verbose;
syst("rm -rf $stage_dir");

# Done
exit;

sub syst($) {
        my $cmd = shift;

	print "Executing: $cmd\n" if $verbose >1;
	my $result = `$cmd 2>&1`;
	print "Result: $result\n" if $verbose >2;
	print "\n" if $verbose;
}

sub help(;$) {
	my $warning = shift;

	print "$warning\n" if $warning;

	print "
Install.PL - Install SeccubusV2 on your system

Usage: Install.PL [--basedir=<base path>] [--wwwdir=<www path>] 
                  [--bindir=<binary path>] [--moddir=<module path>] 
		  [--scandir=<scanners path>] [--confdir=<configuration path>]
		  [--dbdir=<database file dir>] [--owner=<file owner>] 
		  [--wwwoner=<www file owner>] [--stage_dir=<stage path>] 
		  [--buildroot=<build root> ] [--createdirs] [--help] 
		  [--verbose] [--quiet]

Options (all optional):
--basedir (-b)	- Base directory in which files will be installed 
		  /home/seccubus by default
--wwwdir (-w)	- Directory where web server files will be installed
		  <basedir>/www by default
--bindir	- Directory where command line files will be installed
		  <basedir>/bin by default
--moddir (-m)	- Directory where the .pm files will be installed
		  <basedir>/SeccubusV2 by default
--scandir (-s)	- Direcotry where the scanner drivers will be installed
		  <basedir>/scanners> by default
--confdir (-c)	- Directory where configuraiton files will be installed
		  <basedir>/etc by default
--dbdir (-d)	- Directory where database creation and update files will be 
		  installed
		  <basedir>/db by default
--owner (-o)	- Ownership of the files as you would normally specify them for
		  the chown command
		  By default the file ownership is not changes and thus defaults
		  to the user running this script
--wwwowner	- Ownership of the files for the webserver as you would 
		  normally specify them for the chown command
		  By default the file ownership is not changes and thus defaults
		  to the user running this script
--stage_dir	- Directory where the files will be staged first. This option
		  is usually only used by packagers
		  /tmp/SeccubusV2.stage.<pid> by default
--stageonly	- Stop after the staging is done, do not clean the staging
		  directory
--buildroot	- Create the file and directory structures in this place, but
		  don't append this to the hard coded paths. This option is 
		  mainly intended for package builders
--createdirs	- Create the destination directories. If specified the 
		  destination directories will be created, otherwise the 
		  installation will fail
--help		- Displays this information
--verbose (-v)	- Generate verbose output. Specify twice for even more output
--quiet (-q)	- Do not generate output. Overrides --verbose.
";
	exit;
}
=======
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

>>>>>>> f01fefbeef51848e21c272957425e7cd92ce8a78
