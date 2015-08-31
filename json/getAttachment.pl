#!/usr/bin/env perl
# Copyright 2015 Frank Breedijk
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
# Gets rundata
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusRuns;

my $query = CGI::new();

my $workspace_id = $query->param("workspaceId");
my $scan_id = $query->param("scanId");
my $run_id = $query->param("runId");
my $attachment_id = $query->param("attachmentId");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	die("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	die("WorkspaceId is not numeric");
} elsif (not (defined ($scan_id))) {
	die("Parameter scanId is missing");
} elsif ( $scan_id + 0 ne $scan_id ) {
	die("scanId is not numeric");
} elsif (not (defined ($run_id))) {
	die("Parameter runId is missing");
} elsif ( $run_id + 0 ne $run_id ) {
	die("runId is not numeric");
} elsif (not (defined ($attachment_id))) {
	die("Parameter attachmentId is missing");
} elsif ( $attachment_id + 0 ne $attachment_id ) {
	die("attachmentId is not numeric");
};

my $att = get_attachment($workspace_id, $scan_id, $run_id, $attachment_id);
my $row = shift @$att;

print "Content-type:application/x-download\n";
print "Content-Disposition:attachment;filename=$$row[0]\n\n";

print $$row[1];

exit;
