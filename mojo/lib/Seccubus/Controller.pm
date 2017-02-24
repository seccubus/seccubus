package Seccubus::Controller;
use Mojo::Base 'Mojolicious::Controller';

use parent 'Mojolicious::Controller';

use lib "..";
use SeccubusV2;
use Data::Dumper;

# This action will render a template
sub new {
	my $class = shift;

	my $self = $class->SUPER::new(@_);

	my $r = $self->res();

	# Set some default security an caching headers
	$r->headers()->header('Server' => "Seccubus v$SeccubusV2::VERSION");
	$r->headers()->header('X-Frame-Options' => 'DENY');
	$r->headers()->header('X-XSS-Protection' => "1; 'mode=block'");
	$r->headers()->header('Cache-Control' => 'no-store, no-cache, must-revalidate');
	$r->headers()->header('X-Clacks-Overhead' => 'GNU Terry Pratchett');

	return $self;
}

1;
