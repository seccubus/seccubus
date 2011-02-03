#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Seccubus installation script
# ------------------------------------------------------------------------------
#  Copyright 2011 Frank Breedijk of Schuberg Philis
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
# ------------------------------------------------------------------------------

use strict;
use Getopt::Long;

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
	$buildroot,
	$buildonly,
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

my @patches = qw(
			SeccubusV2.pm
			etc/config.xml.mysql.example
		);

$base_dir = "/home/seccubus";
$buildroot = "/tmp/SeccubusV2.build.$$";
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
		'buildroot=s'	=> \$buildroot,
		'buildonly'	=> \$buildonly,
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

if ( $help ) {
	help();
} 

# Check if we have a build root
print "Checking to see if target paths exists or created\n" if $verbose;
if ( -d $buildroot ) {
	print "Buildroot '$buildroot' exists\n" if $verbose;
} else {
	print "Creating buildroot '$buildroot'\n" if $verbose;
	syst("mkdir '$buildroot'");
}

# Copy files to buildroot
print "Copying files to buildroot\n" if $verbose;
foreach my $file ( @files ) {
	syst("cp $file $buildroot");
}
print "Copying directories to buildroot\n" if $verbose;
foreach my $dir ( @dirs ) {
	syst("cp -r $dir $buildroot");
}

print "Patching file paths\n" if $verbose;
foreach my $file ( @patches ) {
	$file = "$buildroot/$file";
	syst("sed -i 's:/opt/Seccubus/SeccubusV2:$mod_dir:' $file");
	syst("sed -i 's:/opt/Seccubus/scanners:$scan_dir:' $file");
	syst("sed -i 's:/opt/Seccubus/etc:$conf_dir:' $file");
	syst("sed -i 's:/opt/Seccubus/db:$db_dir:' $file");
}

print "Chaning file ownership\n" if $verbose && ( $owner || $wwwowner );
syst("chown -R $owner $buildroot") if $owner;
syst("chown -R $wwwowner $buildroot/www") if $wwwowner;

# Quit if buildonly
exit if $buildonly;

# Check to see if paths need to be created
if ( -d $base_dir ) {
	print "Basedir '$base_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs ) {
		print "Creating basedir '$base_dir'\n" if $verbose;
		syst("mkdir '$base_dir'");
		syst("chown $owner $base_dir") if $owner;
	} else {
		help("Basedir '$base_dir' does not exist");
	}
}

if ( -d $www_dir ) {
	print "Wwwdir '$www_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $www_dir,$base_dir == 0 ) {
		print "Creating wwwdir '$www_dir'\n" if $verbose;
		syst("mkdir '$www_dir'");
		syst("chown $wwwowner $www_dir") if $wwwowner;
	} else {
		help("Wwwdir '$www_dir' does not exist");
	}
}
if ( -d $bin_dir ) {
	print "Bindir '$bin_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $bin_dir,$base_dir == 0 ) {
		print "Creating wwwdir '$bin_dir'\n" if $verbose;
		syst("mkdir '$bin_dir'");
		syst("chown $owner $bin_dir") if $owner;
	} else {
		help("Bindir '$bin_dir' does not exist");
	}
}

if ( -d $mod_dir ) {
	print "Moddir '$mod_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $mod_dir,$base_dir == 0 ) {
		print "Creating moddir '$mod_dir'\n" if $verbose;
		syst("mkdir '$mod_dir'");
		syst("chown $owner $mod_dir") if $owner;
	} else {
		help("Moddir '$mod_dir' does not exist");
	}
}

if ( -d $scan_dir ) {
	print "Scandir '$scan_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $scan_dir, $base_dir == 0 ) {
		print "Creating scandir '$scan_dir'\n" if $verbose;
		syst("mkdir '$scan_dir'");
		syst("chown $owner $scan_dir") if $owner;
	} else {
		help("Scandir '$scan_dir' does not exist");
	}
}

if ( -d $conf_dir ) {
	print "Confdir '$conf_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $conf_dir, $base_dir == 0 ) {
		print "Creating confdir '$conf_dir'\n" if $verbose;
		syst("mkdir '$conf_dir'");
		syst("chown $owner $conf_dir") if $owner;
	} else {
		help("Confdir '$conf_dir' does not exist");
	}
}

if ( -d $db_dir ) {
	print "Dbdir '$db_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $db_dir, $base_dir == 0 ) {
		print "Creating dbdir '$db_dir'\n" if $verbose;
		syst("mkdir '$db_dir'");
		syst("chown $owner $db_dir") if $owner;
	} else {
		help("Dbdir '$db_dir' does not exist");
	}
}

if ( -d $doc_dir ) {
	print "Docdir '$doc_dir' exists\n" if $verbose;
} else {
	if ( $create_dirs || index $doc_dir, $base_dir == 0 ) {
		print "Creating docdir '$doc_dir'\n" if $verbose;
		syst("mkdir '$doc_dir'");
		syst("chown $owner $doc_dir") if $owner;
	} else {
		help("Docdir '$doc_dir' does not exist");
	}
} 

# Moving files
print "Copying files and directories" if $verbose;
foreach my $file ( @files ) {
	syst("cp -p $buildroot/$file $base_dir");
}
syst("cp -p -r $buildroot/www/* $www_dir");
syst("cp -p -r $buildroot/bin/* $bin_dir");
syst("cp -p -r $buildroot/SeccubusV2/* $mod_dir");
syst("cp -p -r $buildroot/scanners/* $scan_dir");
syst("cp -p -r $buildroot/etc/* $conf_dir");
syst("cp -p -r $buildroot/db/* $db_dir");
syst("cp -p -r $buildroot/docs/* $doc_dir");

# Link SeccubusV2.pm into www_dir
print "Creating symbolic link to SeccubusV2.pm in wwwdir\n" if $verbose;
syst("cd $www_dir;ln -s $base_dir/SeccubusV2.pm");

# Clean up build root
print "Cleaning up...\n" if $verbose;
syst("rm -rf $buildroot");

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
		  [--wwwoner=<www file owner>] [--buildroot=<build path>] 
		  [--createdirs] [--help] [--verbose] [--quiet]

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
--buildroot	- Directory where the files will be built first. This option is 
		  usually only used by distribution builders
		  /tmp/SeccubusV2.build.<pid> by default
--buildonly	- Stop after the build is done, do not clean the build directory
--createdirs	- Create the destination directories. If specified the 
		  destination directories will be created, otherwise the 
		  installation will fail
--help		- Displays this information
--verbose (-v)	- Generate verbose output. Specify twice for even more output
--quiet (-q)	- Do not generate output. Overrides --verbose.
";
	exit;
}
