#!/usr/bin/perl

use XML::Simple;
use DBI;

$scan = "nessustest";
$min_sev = "2";  #Medium severity, less than 2 is "High" or no rating.
$limit = 20;

$config = "/etc/seccubus/config.xml";
$config = XMLin($config, ForceArray => [qw(monkey)], KeyAttr => [ qw(id) ], SuppressEmpty => '');

$dbh = DBI->connect_cached("DBI:Pg:dbname=$config->{database}->{database}", $config->{database}->{user}, $config->{database}->{password});


$query = "SELECT id from scans where name=?;";
my $sth = $dbh->prepare($query);
$sth->execute($scan) or
    die "Problem with execution of sql statement: $query";
@arr = $sth->fetchrow_array;
$scan_id = $arr[0];

# status=1 is "New"
$query = "SELECT count(id) from findings where scan_id=? and status=1;";
$sth = $dbh->prepare($query);
$sth->execute($scan_id) or
    die "Problem with execution of sql statement: $query";
@arr = $sth->fetchrow_array;
$new_total = $arr[0];

# meets minimum severity
$query = "SELECT count(id) from findings where scan_id=? and severity <= ?;";
$sth = $dbh->prepare($query);
$sth->execute($scan_id,$min_sev) or
    die "Problem with execution of sql statement: $query";
@arr = $sth->fetchrow_array;
$sev_total = $arr[0];

# meets minimum severity AND is New
$query = "SELECT count(id) from findings where scan_id=? and severity <= ? and status=1;";
$sth = $dbh->prepare($query);
$sth->execute($scan_id,$min_sev) or
    die "Problem with execution of sql statement: $query";
@arr = $sth->fetchrow_array;
$total = $arr[0];

print "New findings: $new_total\n";
print "Findings with minimum severity of Medium: $sev_total\n\n";

## auto "no-issue" Sev=3 and Sev=4 ?

print "Both New and Medium or higher: $total\n";
print "Summary:\n";

if($total <= $limit){
    $query = "SELECT id,host,port,(regexp_split_to_array(finding, E'\\\\n'))[1] from findings where scan_id=? and severity <= ? and status=1;";
    $sth = $dbh->prepare($query);
    $sth->execute($scan_id,$min_sev) or
	die "Problem with execution of sql statement: $query";
    $ref = $sth->fetchall_arrayref;

    print "ID  HOST  PORT  FINDING\n";
    foreach $arr_ref (@{$ref}){
	print "${$arr_ref}[0] ${$arr_ref}[1] ${$arr_ref}[2]    ${$arr_ref}[3]\n";
    }
}else{
    print "Supressed.  Over Limit\n";
}







