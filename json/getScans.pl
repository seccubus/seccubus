#!/usr/bin/env perl
# Copyright 2013 Frank Breedijk, Your Name, blabla1337, Sphaz
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
# List the scans
# ------------------------------------------------------------------------------

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use lib "..";
use SeccubusV2;
use SeccubusScans;

my $query = CGI::new();
my $json = JSON->new();

print $query->header(-type => "application/json", -expires => "-1d");

my $workspace_id = $query->param("workspaceId");

# Return an error if the required parameters were not passed 
if (not (defined ($workspace_id))) {
	bye("Parameter workspaceId is missing");
} elsif ( $workspace_id + 0 ne $workspace_id ) {
	bye("WorkspaceId is not numeric");
};

eval {
	my @data;
	my $scans = get_scans($workspace_id);
        my $paramline;
	foreach my $row ( @$scans ) {
		$paramline = $$row[3];
		my $wanted;
                if (index($paramline,'-p ') != -1) {
                   ($wanted) = $paramline =~ /-p(.*) --policy/;
		   $paramline =~ s/$wanted/ \[maskedpassword\]/;
 		} elsif (index($paramline,'--pw ') != -1) {
                   ($wanted) = $paramline =~ /--pw(.*) --rc/;
                   $paramline =~ s/$wanted/ \[maskedpassword\]/;
		}
		push (@data, {
			'id'		=> $$row[0],
			'name'		=> $$row[1],
			'scanner'	=> $$row[2],
			'parameters'	=> $paramline,
			'lastScan'	=> $$row[4],
			'runs'		=> $$row[5],
			'findCount'	=> $$row[6],
			'targets'	=> $$row[7],
			'workspace'	=> $$row[8],
			'notifications'	=> $$row[9],
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

