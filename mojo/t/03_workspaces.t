use Mojo::Base -strict;

use Test::More;
use Test::Mojo;
use Data::Dumper;

my $db_version = 0;
foreach my $data_file (<../db/data_v*.mysql>) {
	$data_file =~ /^\.\.\/db\/data_v(\d+)\.mysql$/;
	$db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -uroot -e "drop database seccubus"`;
`mysql -uroot -e "create database seccubus"`;
`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
`mysql -uroot -e "flush privileges;"`;
`mysql -uroot seccubus < ../db/structure_v$db_version.mysql`;
`mysql -uroot seccubus < ../db/data_v$db_version.mysql`;

my $t = Test::Mojo->new('Seccubus');
# List empty
$t->get_ok('/workspaces')
	->status_is(200)
	->json_hasnt("/0")
	;

# Create
$t->post_ok('/workspaces', json => { 'name' => 'workspace1'})
	->status_is(200)
	->json_is('/name','workspace1')
	->json_is('/id',100)
	;
# List one
$t->get_ok('/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',100)
	->json_is('/0/name','workspace1')
	->json_hasnt('/1')
	;

# Create duplicate
$t->post_ok('/workspaces', json => { 'name' => 'workspace1'})
	->status_is(500)
	;

# List one
$t->get_ok('/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',100)
	->json_is('/0/name','workspace1')
	->json_hasnt('/1')
	;

# Create without name
$t->post_ok('/workspaces', json => { 'names' => 'workspace2'})
	->status_is(500)
	;

# List one
$t->get_ok('/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',100)
	->json_is('/0/name','workspace1')
	->json_hasnt('/1')
	;

# Create with additional attributes
$t->post_ok('/workspaces', json => { 'name' => 'workspace2', 'bla' => 'hottentottententententoonstelling'})
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','workspace2')
	->json_hasnt('/bla')
	;

# List two
$t->get_ok('/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',100)
	->json_is('/0/name','workspace1')
	->json_has("/1")
	->json_is('/1/id',101)
	->json_is('/1/name','workspace2')
	->json_hasnt('/2')
	;

# Rename non-existent workspace
$t->put_ok('/workspace/102', json => { name => 'aap'})
	->status_is(500)
	;

# Rename to duplibate name
$t->put_ok('/workspace/101', json => { name => 'workspace1'})
	->status_is(500)
	;

# Rename ok
$t->put_ok('/workspace/101', json => { name => 'aap'})
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','aap')
	->json_hasnt('/bla')
	;

# List two
$t->get_ok('/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',101)
	->json_is('/0/name','aap')
	->json_has("/1")
	->json_is('/1/id',100)
	->json_is('/1/name','workspace1')
	->json_hasnt('/2')
	;

# Rename additional attributes
$t->put_ok('/workspace/101', json => { name => 'aap2', "bla" => "hottentottententententoonstelling"})
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','aap2')
	->json_hasnt('/bla')
	;

# List two
$t->get_ok('/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',101)
	->json_is('/0/name','aap2')
	->json_has("/1")
	->json_is('/1/id',100)
	->json_is('/1/name','workspace1')
	->json_hasnt('/2')
	;

# Rename to current name
$t->put_ok('/workspace/101', json => { name => 'aap2' })
	->status_is(200)
	->json_is('/id',101)
	->json_is('/name','aap2')
	->json_hasnt('/bla')
	;
	
# List two
$t->get_ok('/workspaces')
	->status_is(200)
	->json_has("/0")
	->json_is('/0/id',101)
	->json_is('/0/name','aap2')
	->json_has("/1")
	->json_is('/1/id',100)
	->json_is('/1/name','workspace1')
	->json_hasnt('/2')
	;

done_testing();
