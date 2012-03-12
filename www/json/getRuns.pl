#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Gets rundata
# ------------------------------------------------------------------------------
# Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusRuns;

my $query = CGI::new();
my $json = JSON->new();

print $query->header("application/json");

my $workspace_id = $query->param("workspaceId");
my $scan_id = $query->param("scanId");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
} elsif (not (defined ($scan_id))) {
	bye("Parameter scanId is missing");
} elsif ( $scan_id + 0 ne $scan_id ) {
	bye("scanId is not numeric");
};

eval {
	my @data;
	my $runs = get_runs($workspace_id, $scan_id);

	my $old_id = -1;
	foreach my $row ( @$runs ) {
		if ( $old_id ne $$row[0] ) {
			$old_id = $$row[0];
			if ( $$row[2] ) {
				push (@data, {
					'id'		=> $$row[0],
					'time'		=> $$row[1],
					'attachments'	=> [{
						'id'		=> $$row[2],
						'name'		=> $$row[3],
						'description'	=> $$row[4]
					}]
				});
			} else {
				push (@data, {
					'id'		=> $$row[0],
					'time'		=> $$row[1],
				});
			}
		} else {
			push @{$data[-1]->{attachments}}, {
				'id'		=> $$row[2],
				'name'		=> $$row[3],
				'description'	=> $$row[4]
			};
		}
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
