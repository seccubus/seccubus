package Seccubus;
use Mojo::Base 'Mojolicious';
use Seccubus::Controller;
use lib "..";
use SeccubusV2;
use Data::Dumper;

# This method will run once at server start
sub startup {
	my $self = shift;

	# Set an alternative controller class to set some global headers
	$self->controller_class('Seccubus::Controller');

	# Security
	$self->secrets(['SeccubusScanSmarterNotHarder']);

	# Load the REST plugin
	my $r = $self->plugin( "Routes::Restful", => {
		CONFIG => { NAMESPACES => ['Seccubus::Controller'] },
		PARENT => {
			version => {
				API => {
					VERBS => { CREATE => 0, UPDATE => 0, RETRIEVE => 1, DELETE => 0	}
				}
			},
			status => {
				API => {
					VERBS => { CREATE => 0, UPDATE => 0, RETRIEVE => 1, DELETE => 0	}
				}
			}
		}
	});
         
	# Router
	$r = $self->routes;

	# Normal route to controller
	#$r->get('/')->to('default#welcome');
	$r->get('/')->to(cb => sub {  
		my $c = shift;                                   
		$c->reply->static('index.html')                
	}); 
}

1;
