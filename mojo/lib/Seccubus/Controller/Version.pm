package Seccubus::Controller::Version;
use Mojo::Base 'Mojolicious::Controller';

use lib "..";
use SeccubusV2;
use LWP::UserAgent;
use JSON;

# This action will render a template
sub show {
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
			json => {json => $$json[0]},
		);
	}
}

1;
