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
# List the scans
# ------------------------------------------------------------------------------

# Fixes Ticket [ 2981907 ] - Online up2date check
use strict;
use lib "..";
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use SeccubusV2;
use LWP::UserAgent;
use JSON;
use Data::Dumper;

my $config = get_config();

$ENV{PERL_LWP_SSL_CA_FILE} = "$config->{paths}->{configdir}/v2.seccubus.com.bundle";
#die Dumper $config;

#my (
   #);

my $query = CGI::new();
my $json = JSON->new();
my $data = [];

print $query->header(-type => "application/json", -expires => "-1d", -"Cache-Control"=>"no-store, no-cache, must-revalidate", -"X-Clacks-Overhead" => "GNU Terry Pratchett");

my $ua = LWP::UserAgent->new;
#$ua->default_header('Accept-Encoding' => scalar HTTP::Message::decodable());
#$ua->default_header('Accept-Language' => "no, en");

my $verdict = $ua->get("http://v2.seccubus.com/up2date.json.pl?version=$SeccubusV2::VERSION", "Accept", "application/json");
if ( ! $verdict ) {
	print $json->pretty->encode( [ {
		'status'	=> "Error",
		'message'	=> "Cannot check version online! Online version checks are disabled",
		'link'		=> "",
	} ]);
} else { 
	print $verdict->decoded_content;
}
exit;
