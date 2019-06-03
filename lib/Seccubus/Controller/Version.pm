# ------------------------------------------------------------------------------
# Copyright 2017-2019 Frank Breedijk
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
package Seccubus::Controller::Version;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use LWP::UserAgent;
use JSON;

# This action will render a template
sub read {
	my $self = shift;

	my $config = get_config();

	$ENV{PERL_LWP_SSL_CA_FILE} = "$config->{paths}->{configdir}/v2.seccubus.com.bundle";

	my $ua = LWP::UserAgent->new;

	my $current = $ua->get("http://0.0.0.0:4000/version/current.json", "Accept", "application/json");
	if ( ! $current ) {
		$self->render(
			json => { link => "", status => "WARN", message => "Unable to perform online version check" }
		);
	} else {
		my $json = {};
		eval {
			$json = decode_json($current->decoded_content);
		};
		if ($@) {
			$self->render(
				json => { link => "", status => "ERROR", message => "ERROR: " . $current->decoded_content}
			);
			return;
		}
        my $version = $SeccubusV2::VERSION;
        my ( $major, $minor) = split /\./, $version;

        if ( $major == ${$json->{cool}}[0] && $minor == ${$json->{cool}}[1] ) {
            $json = {
                status => "OK",
                message => "You are using the newest version of Seccubus. This version check will be updated soon"
            };
        } elsif ( $major == ${$json->{dev}}[0] && $minor == ${$json->{dev}}[1] ) {
            $json = {
                status => "OK",
                message => "Your version ($version) is the active development version of Seccubus, it includes the latest features but may include the latest artifacts as well ;)"
            };
        } else {
            my $latest = $ua->get("http://0.0.0.0:4000/version/latest/", "Accept", "text/html")->decoded_content;
            my @lines = split(/\n/, $latest);
            my $line = shift @lines;
            while ( $line !~ /div class=\"content post\"/) {
                $line = shift @lines;
            }
            $line = shift @lines;
            my $readme = "";
            while ( $line !~ /\<\/div\>/ ) {
                $readme .= "$line\n";
                $line = shift @lines;
            }
            $json = {
                status => "Error",
                message => "<h1>Version $json->{current}[0].$json->{current}[1] is available, please upgrade...</h1>$readme",
                link => "https://github.com/schubergphilis/Seccubus/releases/latest"
            }
        }



		$self->render(
			json => $json,
		);
	}
}

1;
