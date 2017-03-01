# ------------------------------------------------------------------------------
# Copyright 2017 Frank Breedijk
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

	my $verdict = $ua->get("http://v2.seccubus.com/up2date.json.pl?version=$SeccubusV2::VERSION", "Accept", "application/json");
	if ( ! $verdict ) {
		$self->render(
			json => { link => "", status => "WARN", message => "Unable to perform online version check" } 
		);
	} else { 
		my $json = {};
		eval {
			$json = decode_json($verdict->decoded_content);
		};
		if ($@) {
			$self->render(
				json => { link => "", status => "ERROR", message => "ERROR: " . $verdict->decoded_content}
			);
			return;
		}
		$self->render(
			json => $$json[0],
		);
	}
}

1;
