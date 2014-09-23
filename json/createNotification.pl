#!/usr/bin/env perl
# Copyright 2013 Frank Breedijk
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

print $query->header(-type => "application/json", -expires => "-1d");
print $query->header(-"Cache-Control"=>"no-store, no-cache, must-revalidate");
print $query->header(-"Cache-Control"=>"post-check=0, pre-check=0");

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

