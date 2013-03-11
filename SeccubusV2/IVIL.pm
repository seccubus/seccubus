# ------------------------------------------------------------------------------
# IVIL perl module. This is where most of the real logic is 
# This modules is based on the IVIL standard version v0.2
# ------------------------------------------------------------------------------
# Copyright (C) 2012  Schuberg Philis, Frank Breedijk - Under the MIT license
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
# ------------------------------------------------------------------------------
package IVIL;

=head1 NAME $RCSfile: IVIL.pm,v $

This Pod documentation generated from the module IVIL gives a list
of all functions within the module.

=cut

my $IVIL_VERSION = "0.2";

@ISA = ('Exporter');

@EXPORT = qw ( 
		xml_header
		ivil_open
		ivil_addressee
		ivil_sender
		ivil_close
		get_refs
		ivil_findings
		ivil_finding
	);

use strict;
use Carp;
use HTML::Entities;
use XML::Simple;
use Data::Dumper;

sub xml_header();
sub ivil_open();
sub ivil_addressee($;$);
sub ivil_sender($$$);
sub ivil_close();
sub get_refs($);
sub ivil_findings($);
sub ivil_finding($);
sub load_ivil($;$$$$$);

=head1 IVIL - Functions to read and write IVIL

=head2 xml_header

This function returns the standard XML v1.0 header

=over 2

=item Parameters

=over 4

=item none

=back

=item Checks

none

=back

=cut

sub xml_header() {
	return "<?xml version=\"1.0\" standalone='yes'?>\n";
}

=head2 ivil_open

This function returns the IVIL open tag

=over 2

=item Parameters

=over 4

=item none

=back

=item Checks

none

=back

=cut

sub ivil_open() {
	return "<IVIL version=\"$IVIL_VERSION\">\n";
}

=head2 ivil_close

This function returns the IVIL close tag

=over 2

=item Parameters

=over 4

=item none

=back

=item Checks

none

=back

=cut

sub ivil_close() {
	return "</IVIL>\n";
}

=head2 ivil_addressee

This function returns the IVIL addressee block

=over 2

=item Parameters

=over 4

=item program - Name of the program this is addressed for

=item program_data - hashref containing program specific name value pairs

=back

=item Checks

none

=back

=cut

sub ivil_addressee($;$) {
	my $program = shift;
	my $prog_data = shift;

	my $block = "\t<addressee>\n";
	$block .= "\t\t<program>" . encode_entities($program) . "</program>\n";
	if ( $prog_data ) {
		$block .= "\t\t<programSpecificData>\n";
		foreach my $key ( keys %{$prog_data} ) {
			$block.= "\t\t\t<$key>$prog_data->{$key}<\/$key>\n";
		}
		$block .= "\t\t<\/programSpecificData>\n";
	}
	$block .= "\t<\/addressee>\n";
	return $block;
}

=head2 ivil_sender

This function returns the IVIL addressee block

=over 2

=item Parameters

=over 4

=item scanner - name of the scanner

=item version - version of the scanner, may be undef

=item timestamp - timestamp in YYYYMMDDHHmm(ss) format

=back

=item Checks

The Timestamp is validated against pattern \d{8} or \d{6} if it is 6 digits 00 for the seconds is assumed

=back

=cut

sub ivil_sender($$$) {
	my $scanner = shift;
	my $version = shift;
	my $timestamp = shift;

	my $block = "\t<sender>\n";

	$timestamp .= "00" if $timestamp =~ /^\d{6}$/;
	if ( $timestamp =~ /^\d{8}/ ) {
		$block .= "\t\t<scanner_type>" . encode_entities($scanner) . "</scanner_type>\n";
		$block .= "\t\t<version>" . encode_entities($version) . "</version>\n" if defined($version);
		$block .= "\t\t<timestamp>$timestamp</timestamp>\n";
	} else {
		confess "Invalid timestamp $timestamp";
	}

	$block .= "\t</sender>\n";
	return $block;
}

=head2 get_refs

This function returns a hash of references from finding text. Currently 
supported:
CVE
BID
OSVDB
CVSS2
GLSA
URL

=over 2

=item Parameters

=over 4

=item text - The text for the finding

=back

=item Checks

None

=back

=cut

sub get_refs($) {
	my $text = shift;

	my (
		@refs,
		$pattern,
		%return,
		$fix,
	   );

	my @types = qw(
			OSVDB
			CVE
			BID
			CVSS2
			GLSA
			URL
			SECUNIA
		      );


	foreach my $type ( @types ) {
		my @refs = ();
		$fix = undef;
		# Define pattern match and code reference to fix routine to 
		# normalize referenc for each type of reference we know
		if ( $type eq "OSVDB" ) {
			$pattern = 'OSVDB[\-\:]\d+';
			$fix = sub { 
					my $ref = shift;
					$ref =~ s/\-/:/g; 
					return $ref;
			   	};
		} elsif ( $type eq "CVE" ) {
			$pattern = '(CAN|CVE)\-\d{4}\-\d+';
		} elsif ( $type eq "BID" ) {
			$pattern = 'BID \: \d+';
			$fix = sub { 
					my $ref = shift;
					$ref =~ s/\s+//g; 
					return $ref;
			   	};
		} elsif ( $type eq "CVSS2" ) {
			$pattern = '\(CVSS2\#.*?\)';
			$fix = sub { 
					my $ref = shift;
					$ref =~ s/[\(\)]//g; 
					return $ref;
			   	};
		} elsif ( $type eq "GLSA" ) {
			$pattern = 'GLSA\:\d+\-\d+';
		} elsif ( $type eq "URL" ) {
			$pattern = '(https?\:\/\/|\s+www\.|ftps?\:\/\/|email\:|skype\:)[a-zA-Z0-9\.\/\&\?\%\-\_\=\#\;\:\|\"\@]+';
			$fix = sub { 
					my $ref = shift;
					$ref =~ s/^\s+/http:\/\//g; 
					return $ref;
			   	};
		} elsif ( $type eq "SECUNIA" ) {
			$pattern = 'Secunia\:\d+';
		} else {
			confess "Unknown reference type $type";
		}
	
		my $txt = encode_entities($text);
		while ( $txt =~ m/^.*?($pattern)/ ) {
			my $ref = $1;			# Get ref text
			$txt =~ s/^.*?$pattern//;	# Strip it from text
							# Call the fix routine 
							# (if any)
			$ref = $fix->($ref) if defined $fix;
			push @refs, $ref;	# Push to the array
		}
		$return{$type} = \@refs;
	}
	return %return;
}

=head2 ivil_findings

This function returns the XML block of findings provided to it in an array

=over 2

=item Parameters

=over 4

=item findings - an array of references to dfindigns blocks

=back

=item Checks

None

=back

=cut

sub ivil_findings($) {
	my $findings = shift;
	my $block = "\t<findings>\n";
	
	foreach my $finding ( @$findings ) {
		$block .= ivil_finding($finding);
	}
		
	$block .= "\t</findings>\n";

	return $block;
}

=head2 ivil_finding

This function returns the XML block for finding provided to it in a hashref

=over 2

=item Parameters

=over 4

=item finding - reference to a hash containing a finding

=back

=item Checks

None

=back

=cut

sub ivil_finding($) {
	my $finding = shift;
	my $block = "";
	
	$block .= "\t\t<finding>\n";
	$block .= "\t\t\t<ip>$finding->{ip}<\/ip>\n";
	$block .= "\t\t\t<port>$finding->{port}<\/port>\n";
	$block .= "\t\t\t<id>" . encode_entities($finding->{id}) . "<\/id>\n";
	$block .= "\t\t\t<severity>$finding->{severity}<\/severity>\n";
	$block .= "\t\t\t<finding_txt>";
	$block .= encode_entities($finding->{finding});
	$block .= "<\/finding_txt>\n";
	if ( $finding->{references} ) {
		$block .= "\t\t\t<references>\n";
		foreach my $reftype ( sort keys %{$finding->{references}} ) {
			foreach my $ref ( @{$finding->{references}->{$reftype}} ) {
				$block .= "\t\t\t\t<$reftype>$ref<\/$reftype>\n"
			}
		}
		$block .= "\t\t\t<\/references>\n";
	}
	$block .= "\t\t<\/finding>\n";

	return $block;
}


# Close the PM file.
return 1;
