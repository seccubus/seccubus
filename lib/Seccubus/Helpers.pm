# ------------------------------------------------------------------------------
# Copyright 2017 Frank Breedijk, Glenn ten Cate (blabla1337)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
package Seccubus::Helpers;

=head1 NAME $RCSfile: SeccubusHelpers.pm,v $

This Pod documentation generated from the module SeccubusHelpers gives a list
of all functions within the module.

=cut

#use SeccubusConfig;

use strict;

our @ISA = ('Exporter');

our @EXPORT = qw (
		dirlist
		api_error
		api_result
		run_cmd
		get_severity
	);

use Carp;
use HTML::Entities;
use SeccubusV2;
use Seccubus::DB;
use Data::Dumper;
use Sys::Syslog;


=head2 dirlist

This routine is stolen verbatim from Nikto. It lists the files in a directory
that match a certain pattern.

=over 2

=item Parameters

=over 4

=item DIR - The directory begin listed

=item PATTERN - The regexp pattern these files should match

=back

=item Returns

An array of files that match the pattern

=item Checks

None

=back

=back

=cut

sub dirlist {
    my $DIR     = $_[0] || return;
    my $PATTERN = $_[1] || "";
    my @FILES_TMP = ();

    opendir(DIRECTORY, $DIR) || die print STDERR "+ ERROR: Can't open directory '$DIR': $@";
    foreach my $file (readdir(DIRECTORY)) {
        if ($file =~ /^\./) { next; }    # skip hidden files, '.' and '..'
        if ($PATTERN ne "") {
            if ($file =~ /$PATTERN/) { push(@FILES_TMP, $file); }
        }
        else { push(@FILES_TMP, $file); }
    }
    closedir(DIRECTORY);

    return @FILES_TMP;
}


=head2 run_cmd

Runs a command and returns stdout

=over 2

=item Parameters

=over 4

=item cmd	- The command that should be run

=item print	- Optional Print cmd output to STDOUT is set to a true value.
		  A value greater then 1 also echo's commands

=item remote    - Optional Comma separated list of host,username,key used to
		  connect to a remote host and run the command

=item fetch	- Optional arrayref of files to fetch to /tmp

=item put	- optional arrayref of files to put in /tmp on the remote host and remove them when done

=back

=item Returns

STD out

=item Checks

None

=back

=back

=cut

sub run_cmd {
	my $cmd = shift;
	my $print = shift;
	my $remote = shift;
	my $files = shift;
	my $put = shift;

	my ( $host, $user, $key ) = split /,/, $remote;
	if ( $remote ) {
		confess "Remote specified, but host empty" unless $host;
		confess "Remote specified, but user emprty" unless $user;
		confess "Remote specified, but key empty" unless $key;
		confess "Remote specified, but key doesn't exist" unless -e $key;
	}

	# Put files we need to put
	if ( $remote && $put && @$put ) {
		foreach my $file ( @$put ) {
			confess "File $file specified in put argument doesn't exist" unless -e $file;
			run_cmd("scp -i $key -o 'StrictHostKeyChecking no' $file  $user\@$host:/tmp",$print);
		}
	}

	# Run the actual command
	my @out;
	print "\nRunning $cmd" if $print > 1;
	if ( $remote ) {
		$cmd = "ssh -t -t -o 'StrictHostKeyChecking no' -i $key $user\@$host \"$cmd\"";
		print " as user $user on $host" if $print > 1;
	}
	print "\n" if $print >1;
	open(my $CMD, "-|", $cmd) or confess "Unable to execute";
    select $CMD; $| = 1;
    select STDOUT; $| = 1;
	while ( <$CMD> ) {
		print $_ if $print;
		push @out, $_;
	}
	close $CMD;
    select STDOUT; $| = 0;

	if ( $remote ) {
		# Fetch files
		if ( $files && @$files ) {
			$cmd = "scp -i $key -o 'StrictHostKeyChecking no' -r ";
			foreach my $file ( @$files ) {
				$cmd .= " $user\@$host:$file ";
			}
			$cmd .= " /tmp 2>&1";
			run_cmd($cmd,$print);
		}

		# Cleanup
		if ( $put && @$put ) {
			foreach my $file ( @$put ) {
				confess "File $file specified in put argument doesn't exist" unless -e $file;
				$file =~/^.*\/(.*)$/;
				run_cmd("rm /tmp/$1",$print,$remote);
			}
		}
	}

	return join "", @out;
}

=head2 get_severity

This function returns a reference to an array of severities (id, name,
description)

=over 2

=item Parameters

=over 4

=item None

=back

=item Checks

None

=back

=cut

sub get_severity {
	return sql(
		"return"	=> "ref",
		"query"		=> "SELECT id, name, description
						FROM severity
						ORDER BY id"
	);
}

# Close the PM file.
return 1;
