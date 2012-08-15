#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# 
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusFindings;
use HTML::Entities;
use MIME::Base64;

my $query = CGI::new();
my $count = 0;
my %counter;

print $query->header("text/xml");

print "<seccubusAPI name='getFinding'>\n";

my $workspace_id = $query->param("workspaceID");
my $finding_id = $query->param("findingID");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id) and
		 defined ($finding_id))) {
	print "\t<result>NOK</result>
	<message>Invalid arguments</message>
</seccubusAPI>";
	exit;
}

eval {
	# Get a reference to an array of arrays containing the mutations of the finding
	my $rows = get_finding($workspace_id, $finding_id);
	my $max = @$rows;
	my $count = 1;
	
	print "\t<result>OK</result>
	<data>
		<changes max='$max'>\n";


	# Iterate through all changes
	foreach my $row ( @$rows ) {
		print "\t\t\t<change count='$count' ";
		if ( $count < $max ) {
			print "next='";
			print $count+1;
			print "' ";
		}
		if ( $count > 1 ) {
			print "previous='";
			print $count-1;
			print "' ";
		}
	
		my $remark_b64 = encode_base64($$row[7]);
		my $finding_b64 = encode_base64($$row[6]);

		my $finding = HTML::Entities::encode($$row[6]);
		$finding =~ s/\n/\\n/g;
		my $remark = HTML::Entities::encode($$row[7]);
		$remark =~ s/\n/\\n/g;

		print ">
				<change_id>$$row[0]</change_id>
				<finding_id>$$row[1]</finding_id>
				<host name='$$row[3]'>$$row[2]</host>
				<port>$$row[4]</port>
				<plugin>$$row[5]</plugin>
				<finding base64='$finding_b64'>$finding</finding>
				<remark base64='$remark_b64'>$remark</remark>
				<severity id='$$row[8]'>$$row[9]</severity>
				<status id='$$row[10]'>$$row[11]</status>
				<user id='$$row[12]'>$$row[13]</user>
				<changetime>$$row[14]</changetime>
				<scantime>$$row[15]</scantime>\n";
		print "\t\t\t</change>\n";
		$count++;
	}

	print "\t\t</changes>
	</data>
</seccubusAPI>";
} or do {
	print "\t<result>NOK</result>
	<message>$@</message>
</seccubusAPI>"; 
}



