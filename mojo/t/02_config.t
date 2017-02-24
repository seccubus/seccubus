use Mojo::Base -strict;

use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Seccubus');
$t->get_ok('/config')
	->status_is(200)
	->json_is("/link","")
	->json_is("/status","OK")
	->json_like("/message",qr/(trunk version|is up to date)/i)
	;

done_testing();
