use Mojo::Base -strict;

use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Seccubus');
$t->get_ok('/')
	->status_is(200)
	->content_like(qr/Welcome/i)
	->header_is("X-Clacks-Overhead" => 'GNU Terry Pratchett')
	->header_is("X-Frame-Options" => "DENY")
	->header_is("x-xss-protection" => "1; 'mode=block'")
	->header_like("Server", qr/^Seccubus v\d\.\d+$/)
	->header_unlike("Server", qr/mojo/i)
	;

done_testing();
