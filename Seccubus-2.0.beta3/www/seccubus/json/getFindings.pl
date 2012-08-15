#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Get a full list of findings associated with the filter parameters given
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusFindings;

my $query = CGI::new();
my $json = JSON->new();

print $query->header("application/json");

my $workspace_id = $query->param("workspaceId");
my $scan_id = $query->param("scanId");
$scan_id = 0 unless $scan_id;

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
} elsif ( $scan_id + 0 ne $scan_id ) {
	bye("ScanId is not numeric");
};

eval {
	my @data;
	my %filter;
	foreach my $key ( qw( host hostname port plugin severity ) ) {
		if ($query->param($key) and $query->param($key) ne "all" and $query->param($key) ne "null" ) {
			$filter{$key} = $query->param($key); 
		}
	}
	$filter{finding} = $query->param("finding") if $query->param("finding");
	$filter{remark} = $query->param("remark") if $query->param("remark");

	my $findings = get_findings($workspace_id, $scan_id, \%filter);

	foreach my $row ( @$findings ) {
		push (@data, {
			#$$row[4] = HTML::Entities::encode($$row[4]);
			#$$row[5] = HTML::Entities::encode($$row[5]);
			#$$row[5] =~ s/\n/\\n/g;
			#$$row[6] = HTML::Entities::encode($$row[6]);
			#$$row[6] =~ s/\n/\\n/g;
			'id'		=> $$row[0],
			'host'		=> $$row[1],
			'hostName'	=> $$row[2],
			'port'		=> $$row[3],
			'plugin'	=> $$row[4],
			'find'		=> $$row[5],
			'remark'	=> $$row[6],
		 	'severity'	=> $$row[7],
			'severityName'	=> $$row[8],
			'status'	=> $$row[9],
			'statusName'	=> $$row[10],
			'scanId'	=> $$row[11],
		});
	}
	print $json->pretty->encode(\@data);
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}
