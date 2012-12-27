#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Updates the findings passed by ID with the data passed
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
my $subject = $query->param("subject");
my $recipients = $query->param("recipients");
my $message = $query->param("message");
my $event_id = $query->param("trigger");

# Return an error if the required parameters were not passed 
my $error;
bye($error) if ($error = check_param("workspaceId", $workspace_id, 1));
bye($error) if ($error = check_param("scanId", $scan_id, 1));
bye($error) if ($error = check_param("trigger", $event_id, 1));
bye($error) if ($error = check_param("subject", $subject, 0));
bye($error) if ($error = check_param("recipients", $recipients, 0));
bye($error) if ($error = check_param("message", $message, 0));

eval {
	my @data = ();
	my ($newid, $event_name) = create_notification($workspace_id,$scan_id,$event_id,$subject,$recipients,$message);
	push @data, {
		id		=> $newid,
		event_id	=> $event_id,
		event_name	=> $event_name,
		subject		=> $subject,
		recipient	=> $recipients,
		message		=> $message,
	};
	print $json->pretty->encode(\@data);
} or do {
	bye(join "\n", $@);
};

sub bye($) {
	my $error=shift;
	print $json->pretty->encode([{ error => $error }]);
	exit;
}

