#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Gets notificationdata
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusNotifications;

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
	my $notifications = get_notifications($workspace_id, $scan_id);

	foreach my $row ( @$notifications ) {
		if ( $$row[2] ) {
			push (@data, {
				'id'		=> $$row[0],
				'subject'	=> $$row[1],
				'recipients'	=> $$row[2],
				'message'	=> $$row[3],
				'event_id'	=> $$row[4],
				'event_name'	=> $$row[5]
			})
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
