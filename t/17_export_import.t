#!/usr/bin/env perl
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
# ------------------------------------------------------------------------------
# This little script checks all files te see if they are perl files and if so 
# ------------------------------------------------------------------------------

use strict;
use Algorithm::Diff qw( diff );
use JSON;
use Data::Dumper;
use Test::More;
use SeccubusV2;
use SeccubusWorkspaces;
use SeccubusScans;
use SeccubusFindings;
use SeccubusIssues;
use SeccubusHostnames;
use SeccubusAssets;
use SeccubusNotifications;
use SeccubusUsers;
use SeccubusRuns;

sub webcall(@);


my $db_version = 0;
foreach my $data_file (<db/data_v*.mysql>) {
	$data_file =~ /^db\/data_v(\d+)\.mysql$/;
	$db_version = $1 if $1 > $db_version;
}

ok($db_version > 0, "DB version = $db_version");
`mysql -uroot -e "drop database seccubus"`;
`mysql -uroot -e "create database seccubus"`;
`mysql -uroot -e "grant all privileges on seccubus.* to seccubus\@localhost identified by 'seccubus';"`;
`mysql -uroot -e "flush privileges;"`;
`mysql -uroot seccubus < db/structure_v$db_version.mysql`;
`mysql -uroot seccubus < db/data_v$db_version.mysql`;

my $json = webcall("ConfigTest.pl");
foreach my $t ( @$json ) {
	if ( $t->{name} ne "Configuration file" ) { # Skip in container
		is($t->{result}, "OK", "$t->{name} ($t->{result}) eq OK?");
	}
}

# Create a workspace
$json = webcall("createWorkspace.pl", "name=export");
is($$json[0]->{id},100,"Workspace created");
# Create a scan
$json = webcall("createScan.pl", "workspaceId=100", "name=seccubus", "scanner=SSLlabs", "parameters=--hosts+\@HOSTS+--from-cache+--publish", "targets=www.seccubus.com");
is(@$json, 1, "Correct number of records returned");
is($$json[0]->{id}, 1, "Correct ID returned");
is($$json[0]->{name}, "seccubus", "Correct name returned");
is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned");
is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache --publish', "Correct parameters returned");
is($$json[0]->{targets}, "www.seccubus.com", "Correct targets returned");
is($$json[0]->{workspace}, 100, "Correct workspace returned");
is($$json[0]->{password}, undef, "Correct password returned");
$json = webcall("createScan.pl", "workspaceId=100", "name=schubergphilis", "scanner=SSLlabs", "parameters=--hosts+\@HOSTS+--from-cache+--publish", "targets=www.schubergphilis.com");
is(@$json, 1, "Correct number of records returned");
is($$json[0]->{id}, 2, "Correct ID returned");
is($$json[0]->{name}, "schubergphilis", "Correct name returned");
is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned");
is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache --publish', "Correct parameters returned");
is($$json[0]->{targets}, "www.schubergphilis.com", "Correct targets returned");
is($$json[0]->{workspace}, 100, "Correct workspace returned");
is($$json[0]->{password}, undef, "Correct password returned");

# Read scans back
$json = webcall("getScans.pl", "workspaceId=100");
is(@$json, 2, "Correct number of records returned");
is($$json[0]->{id}, 2, "Correct ID returned");
is($$json[0]->{name}, "schubergphilis", "Correct name returned");
is($$json[0]->{scanner}, "SSLlabs", "Correct scanner returned");
is($$json[0]->{parameters}, '--hosts @HOSTS --from-cache --publish', "Correct parameters returned");
is($$json[0]->{targets}, "www.schubergphilis.com", "Correct targets returned");
is($$json[0]->{workspace}, 100, "Correct workspace returned");
is($$json[0]->{password}, undef, "Correct password returned");
is($$json[1]->{id}, 1, "Correct ID returned");
is($$json[1]->{name}, "seccubus", "Correct name returned");
is($$json[1]->{scanner}, "SSLlabs", "Correct scanner returned");
is($$json[1]->{parameters}, '--hosts @HOSTS --from-cache --publish', "Correct parameters returned");
is($$json[1]->{targets}, "www.seccubus.com", "Correct targets returned");
is($$json[1]->{workspace}, 100, "Correct workspace returned");
is($$json[1]->{password}, undef, "Correct password returned");

# Import data
pass("Importing ssllabs-seccubus scan");
`bin/load_ivil -w export -s seccubus -t 20170101000000 testdata/ssllabs-seccubus.ivil.xml`;
`bin/attach_file -w export -s seccubus -t 20170101000000 -f testdata/ssllabs-seccubus.ivil.xml -d "IVIL file"`;
`bin/attach_file -w export -s seccubus -t 20170101000000 -f testdata/ssllabs-schubergphilis.ivil.xml -d "The wrong IVIL file"`;
pass("Importing ssllabs-schubergphilis scan");
`bin/load_ivil -w export -s schubergphilis -t 20170101000100 testdata/ssllabs-schubergphilis.ivil.xml`;
`bin/attach_file -w export -s schubergphilis -t 20170101000100 -f testdata/ssllabs-schubergphilis.ivil.xml -d "An IVIL file too"`;
pass("Importing ssllabs-seccubus scan, again");
`bin/load_ivil -w export -s seccubus -t 20170101000200 testdata/ssllabs-seccubus.ivil.xml`;
`bin/attach_file -w export -s seccubus -t 20170101000200 -f testdata/ssllabs-seccubus.ivil.xml -d "IVIL file"`;

pass("Manipulating findings and issues");
my $findings = get_findings(100,1,undef,{ plugin => "vulnBeast" });
my @finds;
foreach my $f ( @$findings ) {
	update_finding(
		workspace_id => 100,
		finding_id => $$f[0],
		status => 3,
		remark => "Don't be so vulnerable, please",
		timestamp => "20170101000300",
	);
	push @finds, $$f[0];
}
update_issue(
	workspace_id => 100,
	name => "Beast",
	ext_ref => "666",
	description => "Beast issue",
	status => 1,
	findings => join("\0", @finds),
	timestamp => "20170101000300",
);

my $last_id;
$findings = get_findings(100,2,undef,{ plugin => "supportsRc4" });
@finds = ();
foreach my $f ( @$findings ) {
	update_finding(
		workspace_id => 100,
		finding_id => $$f[0],
		status => 4,
		remark => "You don't have my support either.",
		timestamp => "20170101000400",
	);
	push @finds, $$f[0];
	$last_id = $$f[0];
}
update_issue(
	workspace_id => 100,
	name => "RC4",
	ext_ref => "rc4_ref",
	description => "rc4 issue",
	status => 1,
	findings => join("\0", @finds),
	timestamp => "20170101000400",
);
sleep 1;
update_issue(
	issue_id => 2,
	workspace_id => 100,
	name => "RC4",
	ext_ref => "rc4 ref",
	description => "rc4 issue",
	status => 2,
	findings_remove => $last_id,
	timestamp => "20170101000500",
);
pass("Adding hostsnames");
update_hostname(100,"127.0.0.1","home");

pass("Adding assets");
create_asset(100,"seccubus","seccubus.com\n184.50.88.72");

pass("Adding notifications");
create_notification(100,1,1,"Before","nobody\@example.com","Before scan notification");
create_notification(100,2,2,"After","nobody\@example.com","After scan notification");
create_notification(100,1,3,"On Open","nobody\@example.com","On open notification");

pass("Testbed setup complete");

`bin/export -o /tmp/export.$$ 2>&1`;
isnt($?,0,"Export should fail if workspace parameter is missing");

`bin/export -w export 2>&1`;
isnt($?,0,"Export should fail if out parameter is missing");

`bin/export -w export -o /tmp 2>&1`;
isnt($?,0,"Export should fail output path exists");

`bin/export -w export -o /tmp/export.$$/export.$$ 2>&1`;
isnt($?,0,"Export fails if we cannot create a directory");

`bin/export -w export -o /tmp/export.$$ -s bla 2>&1`;
isnt($?,0,"Export fails if non-existant scan is selected");

`bin/export -w export -o /tmp/export.$$.1 --compress`;
is($?,0,"export command ran ok with compression");

foreach my $att ( <"/tmp/export.$$.1/scan_*/att_*/*"> ) {
	like($att, qr/\.zip$/, "Attachement $att is compressed");
}

`bin/export -w export -o /tmp/export.$$`;
is($?,0,"export command ran ok without compression");
foreach my $att ( <"/tmp/export.$$/scan_*/att_*/*"> ) {
	unlike($att, qr/\.zip$/, "Attachement $att is not compressed");
}

my $json = get_json("/tmp/export.$$/workspace.json");
is_deeply($json, { name => "export" }, "Workspace exported ok");

$json = get_json("/tmp/export.$$/hostnames.json");
is_deeply($json, [ { name => "home", ip => "127.0.0.1" } ], "Hostnames exported ok");

$json = get_json("/tmp/export.$$/scans.json");
is_deeply($json, 
	[
	   {
	      "id" => "2",
	      "targets" => "www.schubergphilis.com",
	      "password" => "",
	      "scanner_param" => "--hosts \@HOSTS --from-cache --publish",
	      "scanner_name" => "SSLlabs",
	      "name" => "schubergphilis"
	   },
	   {
	      "targets" => "www.seccubus.com",
	      "scanner_name" => "SSLlabs",
	      "password" => "",
	      "scanner_param" => "--hosts \@HOSTS --from-cache --publish",
	      "id" => "1",
	      "name" => "seccubus"
	   }
	],
	"Scans exported ok"
);

$json = get_json("/tmp/export.$$/issues.json");
is_deeply($json, 
	[
	   {
	      "ext_ref" => "666",
	      "description" => "Beast issue",
	      "id" => "1",
	      "findings" => [
	         "41",
	         "88"
	      ],
	      "name" => "Beast",
	      "severity" => "0",
	      "status" => "1",
	      "history" => [
	         {
	            "name" => "Beast",
	            "severity" => "0",
	            "status" => "1",
	            "time" => "20170101000300",
	            "user" => "admin",
	            "description" => "Beast issue",
	            "id" => "1",
	            "ext_ref" => "666"
	         }
	      ]
	   },
	   {
	      "findings" => [
	         "136",
	         "227",
	         "272"
	      ],
	      "description" => "rc4 issue",
	      "id" => "2",
	      "ext_ref" => "rc4 ref",
	      "severity" => "0",
	      "history" => [
	         {
	            "ext_ref" => "rc4 ref",
	            "id" => "3",
	            "description" => "rc4 issue",
	            "user" => "admin",
	            "time" => "20170101000500",
	            "name" => "RC4",
	            "severity" => "0",
	            "status" => "2"
	         },
	         {
	            "severity" => "0",
	            "name" => "RC4",
	            "status" => "1",
	            "time" => "20170101000400",
	            "user" => "admin",
	            "ext_ref" => "rc4_ref",
	            "id" => "2",
	            "description" => "rc4 issue"
	         }
	      ],
	      "status" => "2",
	      "name" => "RC4"
	   }
	],
	"Issues exported ok"
);

pass("Checking scan 1");
$json = get_json("/tmp/export.$$/scan_1/runs.json");
is_deeply($json, 
	[
	   {
	      "attachments" => [
	         {
	            "id" => "4",
	            "name" => "ssllabs-seccubus.ivil.xml",
	            "description" => "IVIL file"
	         }
	      ],
	      "timestamp" => "20170101000200"
	   },
	   {
	      "timestamp" => "20170101000000",
	      "attachments" => [
	         {
	            "name" => "ssllabs-seccubus.ivil.xml",
	            "id" => "1",
	            "description" => "IVIL file"
	         },
	         {
	            "id" => "2",
	            "name" => "ssllabs-schubergphilis.ivil.xml",
	            "description" => "The wrong IVIL file"
	         }
	      ]
	   }
	]
	,
	"Runs exported ok"
);

foreach my $att ( @{ $$json[0]->{attachments} } , @{ $$json[1]->{attachments} } ) {
	ok(-e "/tmp/export.$$/scan_1/att_$att->{id}/$att->{name}", "Attachment $att->{name} exists");
}

$json = get_json("/tmp/export.$$/scan_1/notifications.json");
is_deeply($json, 
	[
	   {
	      "subject" => "Before",
	      "message" => "Before scan notification",
	      "recipients" => "nobody\@example.com",
	      "trigger" => "1"
	   },
	   {
	      "subject" => "On Open",
	      "message" => "On open notification",
	      "trigger" => "3",
	      "recipients" => "nobody\@example.com"
	   }
	]
	,
	"Notifications exported ok"
);

my @ffiles = glob "/tmp/export.$$/scan_1/finding_*";
is(@ffiles,97,"There are 97 findings in scan 1");

$json = get_json("/tmp/export.$$/scan_1/finding_96.json");
is_deeply($json, 
	{
	   "finding" => "Public : True\n\nDetermines if this assessment is (publicly) visible on www.ssllabls.com website",
	   "plugin" => "isPublic",
	   "remark" => undef,
	   "severity" => "0",
	   "status" => "1",
	   "id" => "96",
	   "port" => "443/tcp",
	   "history" => [
	      {
	         "port" => "443/tcp",
	         "username" => "importer",
	         "host" => "www.seccubus.com",
	         "time" => "20170101000200",
	         "finding" => "Public : True\n\nDetermines if this assessment is (publicly) visible on www.ssllabls.com website",
	         "remark" => undef,
	         "plugin" => "isPublic",
	         "severity" => "0",
	         "status" => "1",
	         "run" => "20170101000200"
	      },
	      {
	         "run" => "20170101000000",
	         "status" => "1",
	         "time" => "20170101000000",
	         "plugin" => "isPublic",
	         "remark" => undef,
	         "finding" => "Public : True\n\nDetermines if this assessment is (publicly) visible on www.ssllabls.com website",
	         "severity" => "0",
	         "username" => "importer",
	         "host" => "www.seccubus.com",
	         "port" => "443/tcp"
	      }
	   ],
	   "host" => "www.seccubus.com",
       "run" => "20170101000200"
	},
	"Finding 96 exported ok"
);

$json = get_json("/tmp/export.$$/scan_1/finding_41.json");
is_deeply($json, 
	{
	   "plugin" => "vulnBeast",
	   "remark" => "Don't be so vulnerable, please",
	   "severity" => "0",
	   "status" => "3",
	   "history" => [
	      {
	         "plugin" => "vulnBeast",
	         "username" => "admin",
	         "time" => "20170101000300",
	         "remark" => "Don't be so vulnerable, please",
	         "run" => "20170101000200",
	         "severity" => "0",
	         "status" => "3",
	         "finding" => "VULNARABLE to Beast\n\nBeast is considered to be mitigated client side now. See: https://blog.qualys.com/ssllabs/2013/09/10/is-beast-still-a-threat",
	         "port" => "443/tcp",
	         "host" => "www.seccubus.com/184.50.88.72"
	      },
	      {
	         "remark" => undef,
	         "time" => "20170101000200",
	         "username" => "importer",
	         "run" => "20170101000200",
	         "plugin" => "vulnBeast",
	         "port" => "443/tcp",
	         "host" => "www.seccubus.com/184.50.88.72",
	         "status" => "1",
	         "severity" => "0",
	         "finding" => "VULNARABLE to Beast\n\nBeast is considered to be mitigated client side now. See: https://blog.qualys.com/ssllabs/2013/09/10/is-beast-still-a-threat"
	      },
	      {
	         "host" => "www.seccubus.com/184.50.88.72",
	         "port" => "443/tcp",
	         "finding" => "VULNARABLE to Beast\n\nBeast is considered to be mitigated client side now. See: https://blog.qualys.com/ssllabs/2013/09/10/is-beast-still-a-threat",
	         "severity" => "0",
	         "status" => "1",
	         "run" => "20170101000000",
	         "username" => "importer",
	         "remark" => undef,
	         "time" => "20170101000000",
	         "plugin" => "vulnBeast"
	      }
	   ],
	   "finding" => "VULNARABLE to Beast\n\nBeast is considered to be mitigated client side now. See: https://blog.qualys.com/ssllabs/2013/09/10/is-beast-still-a-threat",
	   "id" => "41",
	   "port" => "443/tcp",
	   "host" => "www.seccubus.com/184.50.88.72",
	   "run" => "20170101000200",
	},
	"Finding 41 exported ok"
);

pass("Checking scan 2");
$json = get_json("/tmp/export.$$/scan_2/runs.json");
is_deeply($json, 
	[
	   {
	      "timestamp" => "20170101000100",
	      "attachments" => [
	         {
	            "id" => "3",
	            "name" => "ssllabs-schubergphilis.ivil.xml",
	            "description" => "An IVIL file too"
	         }
	      ]
	   }
	],	,
	"Runs exported ok"
);

foreach my $att ( @{ $$json[0]->{attachments} } , @{ $$json[1]->{attachments} } ) {
	ok(-e "/tmp/export.$$/scan_2/att_$att->{id}/$att->{name}", "Attachment $att->{name} exists");
}

$json = get_json("/tmp/export.$$/scan_2/notifications.json");
is_deeply($json, 
	[
	   {
	      "trigger" => "2",
	      "subject" => "After",
	      "recipients" => "nobody\@example.com",
	      "message" => "After scan notification"
	   }
	]
	,
	"Notifications exported ok"
);

my @ffiles = glob "/tmp/export.$$/scan_2/finding_*";
is(@ffiles,185,"There are 185 findings in scan 2");


`bin/export -w export -o /tmp/export.$$.2 -s schubergphilis`;
is($?,0,"export command ran ok only exporting scan 2");

$json = get_json("/tmp/export.$$.2/scans.json");
is_deeply($json, 
	[
	   {
	      "id" => "2",
	      "targets" => "www.schubergphilis.com",
	      "password" => "",
	      "scanner_param" => "--hosts \@HOSTS --from-cache --publish",
	      "scanner_name" => "SSLlabs",
	      "name" => "schubergphilis"
	   }	],
	"Scan 2 exported ok"
);

ok(! -e "/tmp/export.$$.2/scan_1", "There is no scan_1 directory");

`bin/export -w export -o /tmp/export.$$.3 --after 20170101000100`;
is($?,0,"export command ran ok exporting only after 2017010100100");

$json = get_json("/tmp/export.$$.3/scan_1/runs.json");
is_deeply($json, 
	[
	   {
	      "timestamp" => "20170101000200",
	      "attachments" => [
	         {
	            "name" => "ssllabs-seccubus.ivil.xml",
	            "id" => "4",
	            "description" => "IVIL file"
	         }
	      ]
	   }
	]
	,
	"Scan 1 only has 1 run"
);

$json = get_json("/tmp/export.$$.3/scan_1/finding_1.json");
is(@{$json->{history}},1,"Finding 1 only has 1 history record");

`bin/export -w export -o /tmp/export.$$.4 --after 20170101000200`;
is($?,0,"export command ran ok exporting only after 2017010100200");

my @fs = glob "/tmp/export.$$.4/scan_2/finding_*";
is(@fs,0,"Scan 2 should have 0 findings");

$json = get_json("/tmp/export.$$.4/scan_2/runs.json");
is_deeply($json, [], "Scan 2 has no associated runs" );

#
# Import
#

# Prep for import
edit_workspace(100,"exported");

$json = get_json("/tmp/export.$$/scan_1/finding_1.json");
${$json->{history}}[1]->{username} = "seccubus";
open JS, ">/tmp/export.$$/scan_1/finding_1.json" or die "Cannot write file";
print JS to_json($json, {pretty => 1});
close JS;

`bin/import  2>&1`;
isnt($?,0,"Import fails if input directory is not specified");

`bin/import -i /tmp/export.$$/export.$$ 2>&1`;
isnt($?,0,"Import fails if input directory doesn't exist");

`bin/import -i /tmp/export.$$ --nousers`;
is($?,0,"import command ran ok with --nousers");

my $user_id = get_user_id("seccubus");
is($user_id,undef,"User 'seccubus' should not exist");

`bin/import -w users -i /tmp/export.$$`;
is($?,0,"import command ran ok ");

$user_id = get_user_id("seccubus");
is($user_id,100,"User 'seccubus' was created");

# Compare a normal import $$ vs export
cmp_scan(get_workspace_id("exported"),get_workspace_id("export"),{ nousers => 1 });

# Compressed $$.1 vs compressed import
`bin/import -w compressed_in -i /tmp/export.$$ --compress`;
is($?,0,"import command ran ok ");
`bin/import -w compressed_out -i /tmp/export.$$.1`;
is($?,0,"import command ran ok ");
cmp_scan(get_workspace_id("compressed_in"),get_workspace_id("compressed_out"));

# Only scan 2 $$.2 vs scan 2
`bin/import -w scan2_in -i /tmp/export.$$.2`;
is($?,0,"import command ran ok ");
`bin/import -w scan2_out -i /tmp/export.$$ --scan schubergphilis`;
is($?,0,"import command ran ok ");
cmp_scan(get_workspace_id("scan2_in"),get_workspace_id("scan2_out"));

# export.$$.3 --after 20170101000100
`bin/import -w 0100_in -i /tmp/export.$$.3`;
is($?,0,"import command ran ok ");
`bin/import -w 0100_out -i /tmp/export.$$ --after 20170101000100`;
is($?,0,"import command ran ok ");
cmp_scan(get_workspace_id("0100_in"),get_workspace_id("0100_out"));

# export.$$.4 --after 20170101000200
`bin/import -w 0200_in -i /tmp/export.$$.4`;
is($?,0,"import command ran ok ");
`bin/import -w 0200_out -i /tmp/export.$$ --after 20170101000200 -v -v -v >/tmp/exp.log`;
is($?,0,"import command ran ok ");
cmp_scan(get_workspace_id("0200_in"),get_workspace_id("0200_out"));

# Cleanup
`rm -rf /tmp/export.$$*`;

done_testing();

sub get_json($) {
	my $file = shift;

	open JS, $file or die "Cannot open $file";
	my $json = decode_json(join "", <JS>); 
	close JS;

	return $json;
}

sub webcall(@) {
	my $call = shift;

	my $cmd = "perl -MSeccubusV2 -I SeccubusV2 json/$call ";
	$cmd .= join " ", @_;
	my @result = split /\r?\n/, `$cmd`;
	while ( shift @result ) {};
	return decode_json(join "\n", @result);
}

sub cmp_scan($$;$) {
	my $in = shift;
	my $out = shift;
	my $flags = shift;

	my $fin = {};
	my $fout = {};
	ok($in,"Got workspace id '$in' for in scan");
	ok($in,"Got workspace id '$out' for out scan");
	my $s_in = get_scans($in);
	my $s_out = get_scans($out);
	my $in_count = @$s_in;
	my $out_count = @$s_out;
	is($in_count,$out_count,"Both workspaces have the same amount of scans");
	foreach my $x (0..$in_count-1) { # Scans
		pass("Comparing scan $x");
		# Comparing scan records
		is($$s_in[$x][1],$$s_out[$x][1],"Names are the same");
		is($$s_in[$x][2],$$s_out[$x][2],"Scannernames are the same");
		is($$s_in[$x][3],$$s_out[$x][3],"Scannerparams are the same");
		is($$s_in[$x][4],$$s_out[$x][4],"Lastruns are the same");
		is($$s_in[$x][5],$$s_out[$x][5],"Scancounts are the same");
		is($$s_in[$x][7],$$s_out[$x][7],"Targets are the same");
		is($$s_in[$x][9],$$s_out[$x][9],"Notification counts are the same");
		is($$s_in[$x][10] . "",$$s_out[$x][10] . "","Passwords are the same");

		my $n_in = get_notifications($$s_in[$x][0]);
		my $n_out = get_notifications($$s_out[$x][0]);
		$in_count = @$n_in;
		$out_count = @$n_out;
		is($in_count,$out_count,"Same number of notifications");
		foreach my $n (0..$in_count-1) {
			pass("Comparing notification $n for scan $x");
			# notifications.id, subject, recipients, message, event_id, events.name
			is($$n_in[$n][1],$$n_out[$n][1],"Same subject");
			is($$n_in[$n][2],$$n_out[$n][2],"Same recipients");
			is($$n_in[$n][3],$$n_out[$n][3],"Same message");
			is($$n_in[$n][4],$$n_out[$n][4],"Same trigger");
			is($$n_in[$n][5],$$n_out[$n][5],"Same triggername");

		} # Notifications

		my $f_in  = get_findings($in, $$s_in[$x][0] ,undef,undef,-1);
		my $f_out = get_findings($out,$$s_out[$x][0],undef,undef,-1);
		$in_count = @$f_in;
		$out_count = @$f_out;
		is($in_count,$out_count,"Same number of findings");
		foreach my $f (0..$in_count-1) {
			pass("Comparing finding $f in scan $x");
			# findings.id, findings.host, host_names.name as hostname, 	port, plugin, finding, remark,
			# findings.severity as severity_id, severity.name as severity_name, 
			# findings.status as status_id, finding_status.name as status, findings.scan_id as scan_id,
			# scans.name as scan_name, runs.time as run_time
			foreach my $field (1..10 , 12..13 ) {
				is($$f_in[$f][$field],$$f_out[$f][$field],"Field $field is the same");
			}

			my $fh_in  = get_finding($in ,$$f_in[$f][0] );
			my $fh_out = get_finding($out,$$f_out[$f][0]);
			$in_count = @$fh_in;
			$out_count = @$fh_out;
			# finding_changes.id, findings.id, host, host_names.name, port, plugin, 
			# finding_changes.finding, finding_changes.remark, finding_changes.severity, severity.name,
			# finding_changes.status, finding_status.name, user_id, username, 
			# finding_changes.time as changetime, runs.time as runtime
			foreach my $fh ( 0..$in_count-1 ) {
				pass("Comparting history record $fh of finding $f in scan $x");
				foreach my $field ( 2..11, 13..14) {
					unless ( $field == 13 && $flags->{nousers} ) {
						is($$fh_in[$fh][$field],$$fh_out[$fh][$field],"Field $field is the same");
					}
				}
			} # History

			# Store for issue check
			$fin->{$$f_in[$f][0]} = "$$f_in[$f][1]/$$f_in[$f][3]/$$f_in[$f][4]";
			$fout->{$$f_out[$f][0]} = "$$f_out[$f][1]/$$f_out[$f][3]/$$f_out[$f][4]";
		} # Findings

		my $r_in  = get_runs($in,  $$s_in[$x][0] );
		my $r_out = get_runs($out, $$s_out[$x][0]);
		$in_count = @$r_in;
		$out_count = @$r_out;
		is($in_count,$out_count,"Same number of runs");
		foreach my $r (0..$in_count-1) {
			# runs.id, time, attachments.id, attachments.name, description
			pass("Comparing run record $r of scan $x");
			foreach my $f ( 1,3,4 ) {
				is($$r_in[$r][$f],$$r_out[$r][$f],"Field $f is the same");
			}
			if ($$r_in[$r][2] || $$r_out[$r][2] ) {
				my $att_in  = get_attachment($in ,$$s_in[$x][0], $$r_in[$r][0], $$r_in[$r][2]);
				my $att_out = get_attachment($out,$$s_out[$x][0],$$r_out[$r][0],$$r_out[$r][2]);
				is($$att_in[$r][0],$$att_out[$r][0],"Attachment names are the same");
				if ( $$att_in[$r][0] !~ /\.zip$/ && $$att_out[$r][0] !~ /\.zip$/ ) {
					is($$att_in[$r][1],$$att_out[$r][1],"Attachment content is the same");
				}
			}
		}
	} #scans

	my $i_in = get_issues($in, undef,1,undef);
	my $i_out= get_issues($out,undef,1,undef);
	$in_count = @$i_in;
	$out_count = @$i_out;
	is($in_count,$out_count,"Smae number of issue records");
	foreach my $i (0..$in_count-1) {
		pass("Comparing issue record $i");
		# i.id, i.name, i.ext_ref, i.description, i.severity, severity.name, i.status, 
		# issue_status.name, i2f.finding_id
		foreach my $f (1..7) {
			is($$i_in[$i][$f],$$i_out[$i][$f],"Field $f is the same");
		} 
		if ( defined $$i_in[$i][8] && defined $$i_out[$i][8] ) {
			is($fin->{$$i_in[$i][8]},$fout->{$$i_out[$i][8]},"Record $i refers to the same finding");
		} elsif ( ! defined $$i_in[$i][8] && ! defined $$i_out[$i][8] ) {
			pass("Record $i does not refer a finding");
		} elsif ( defined $$i_in[$i][8] ) {
			fail("Record $i in refers to a finding, but out doesn't");
		} else {
			fail("Record $i out refers to a finding, but in doesn't");
		}
	}
}
