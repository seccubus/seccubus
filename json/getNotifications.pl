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

my $scan_id = $query->param("scanId");

# Return an error if the required parameters were not passed 
my $error;
bye($error) if $error = check_param("ScanId", $scan_id, 1);

eval {
	my @data;
	my $notifications = get_notifications($scan_id);

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
