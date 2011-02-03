#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Updates the findings passed by ID with the data passed
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use lib "..";
use SeccubusV2;
use SeccubusFindings;

my $query = CGI::new();

print $query->header("text/xml");

print "<seccubusAPI name='updateFindings'>\n";

my $workspaceid = $query->param("workspaceid");
my @ids = $query->param("ids[]");
my $remark = $query->param("remark");
my $status = $query->param("status");
my $overwrite = $query->param("overwrite");

# Return an error if the required parameters were not passed 
if (not (defined ($workspaceid))) {
	print "\t<result>NOK</result>
	<message>Invalid argument</message>
</seccubusAPI>";	
	exit;
}

if ( $overwrite eq "true" || $overwrite == 1 ) {
	$overwrite = 1;
} else {
	$overwrite = 0;
}

if ( @ids == 0 ) {
	print "\t<result>NOK</result>
	<message>No ids passed to update</message>
</seccubusAPI>";
	exit;
} else {
	if ( $status < 0 || ( $status > 6 && $status != 99 ) ) {
		print "\t<result>NOK</result>
	<message>Invalid status code</message>
</seccubusAPI>"; 
	exit;
	}
}

print "\t<data>
		<updates>\n";
for my $id ( @ids ) {
	print "\t\t\t<finding id='$id'>";
	eval {
		
		update_finding(	"finding_id"	=> $id,
			"workspace_id"	=> $workspaceid,
			"status"	=> $status,
			"remark"	=> $remark,
			"overwrite"	=> $overwrite,
		    );
		print "OK</finding>\n";
	} or do {
		print "NOK</finding>\n";
		
		print "\t\t</updates>
	</data>
	<result>NOK</result>
	<message>$@</message>
</seccubusAPI>";
		exit; 
	}
	
};
print "\t\t\t<remark>$remark</remark>
			<status>$status</status>
			<overwrite>$overwrite</overwrite>
		</updates>
	</data>
	<result>OK</result>
	<message>Finding successfully changed</message>
</seccubusAPI>"; 
