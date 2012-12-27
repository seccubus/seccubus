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

my $notification_id = $query->param("id");

# Return an error if the required parameters were not passed 
if (not (defined ($notification_id))) {
	bye("Parameter id is missing");
} elsif ( $notification_id + 0 ne $notification_id ) {
	bye("id is not numeric");
};

eval {
	if ( del_notification($notification_id) ) {
		my @data;
		push (@data, {'id' => $notification_id});
		print $json->pretty->encode(\@data);
	} else {
		bye("Premission denied");
	}
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}
