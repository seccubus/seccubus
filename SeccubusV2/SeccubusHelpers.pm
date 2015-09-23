# ------------------------------------------------------------------------------
# Copyright 2015 Frank Breedijk, Glenn ten Cate (blabla1337)
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
package SeccubusHelpers;

=head1 NAME $RCSfile: SeccubusHelpers.pm,v $

This Pod documentation generated from the module SeccubusHelpers gives a list
of all functions within the module.

=cut

#use SeccubusConfig;

@ISA = ('Exporter');

@EXPORT = qw ( 
		check_config
		dirlist
		api_error
		api_result
		run_cmd
		get_severity
	);

use strict;
use Carp;
use HTML::Entities;
use SeccubusDB;
use Data::Dumper;

sub check_config();
sub dirlist($;$);
sub api_error($$);
sub api_result($;$$$);
sub run_cmd($;$$$$);

=head2 check_config

This function checks the configuration file for obvious errors

=over 2

=item Parameters

=over 4

=item None

=back

=item Returns

True if the config is not obviously invalid

=item Checks

None

=back

=back

=cut

sub check_config() {
	my $ok = 1;
	my $config = SeccubusV2::get_config();
	if ( ! $config->{database}->{database} ) {
		confess "No DB configuration in config.xml";
		$ok = undef;
	}
	return $ok;
}

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

sub dirlist($;$) {
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

=head2 api_error

This function prints a standard Seccubus API error message and exits the program

=over 2

=item Parameters

=over 4

=item api_name - Name of the api that returns the error

=item message  - Error message in the error output

=back

=item Returns

None

=item Checks

None

=back

=back

=cut

sub api_error($$) {
	my $api_name = shift;
	my $error_msg = shift;

	print "<seccubusAPI name='$api_name'>\n";
	print "<result>NOK</result>\n";
	print "<message>" . encode_entities($error_msg) . "</message>\n";
	print "</seccubusAPI>\n";
	exit;
}

=head2 api_result

This function prints a standard Seccubus API output message.

=over 2

=item Parameters

=over 4

=item api_name - Name of the api that returns the output

=item message  - Optional message in the output

=item data     - Optional data segment in the output

=item iserror  - Optional, indicates that the output is an error message, negative by default

=back

=item Returns

None

=item Checks

None

=back

=back

=cut

sub api_result($;$$$) {
	my $api_name = shift;
	my $msg = shift;
	my $data = shift;
	my $iserror = shift;

	if ( $iserror ) {
		$iserror = "OK";
	} else {
		$iserror = "NOK";
	}

	print "<seccubusAPI name='$api_name'>\n";
	print "<result>$iserror</result>\n";
	if ( $msg ) {
		print "<message>" . encode_entities($msg) . "</message>\n";
	}
	if ( $data ) {
		print "<data>\n$data\n</data>";
	}
	print "</seccubusAPI>\n";
	exit;
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

sub run_cmd($;$$$$) {
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
		confess "Remote specified, but key doesn't exist" unless $key;
	}

	# Put files we need to put
	if ( $remote && $put && @$put ) {
		foreach my $file ( @$put ) {
			confess "File $file specified in put argument doesn't exist" unless -e $file;
			run_cmd("scp -i $key $file $user\@$host:/tmp",$print);
		}
	}

	# Run the actual command
	my @out;
	print "\nRunning $cmd" if $print > 1;
	if ( $remote ) {
		$cmd = "ssh -t -t -i $key $user\@$host \"$cmd\"";
		print " as user $user on $host" if $print > 1;
	}
	print "\n" if $print >1;
	open CMD, "$cmd |" or confess "Unable to execute";
	while ( <CMD> ) {
		print $_ if $print;
		push @out, $_;
	}
	close CMD;

	if ( $remote ) {
		# Fetch files
		if ( $files && @$files ) {
			$cmd = "scp -i $key ";
			foreach my $file ( @$files ) {
				$cmd .= " -r $user\@$host:$file ";
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

sub get_severity(;) {
	return sql(
		"return"	=> "ref",
		"query"		=> "SELECT id, name, description
						FROM severity
						ORDER BY id"
	);
}

# Close the PM file.
return 1;
