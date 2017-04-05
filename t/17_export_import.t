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
use SeccubusFindings;
use SeccubusIssues;
use SeccubusHostnames;
use SeccubusAssets;
use SeccubusNotifications;

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

`bin/export -o /tmp/export.$$`;
isnt($?,0,"Export should fail if workspace parameter is missing");

`bin/export -w export`;
isnt($?,0,"Export should fail if out parameter is missing");

`bin/export -w export -o /tmp`;
isnt($?,0,"Export should fail output path exists");

`bin/export -w export -o /tmp/export.$$/export.$$`;
isnt($?,0,"Export fails if we cannot create a directory");

`bin/export -w export -o /tmp/export.$$ -s bla`;
isnt($?,0,"Export fails if non-existant scan is selected");

`bin/export -w export -o /tmp/export.$$.1 --compress`;
is($?,0,"export command ran ok with compression");

for my $att ( <"/tmp/export.$$.1/scan_*/att_*/*"> ) {
	like($att, qr/\.zip$/, "Attachement $att is compressed");
}

`bin/export -w export -o /tmp/export.$$`;
is($?,0,"export command ran ok without compression");
for my $att ( <"/tmp/export.$$/scan_*/att_*/*"> ) {
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
	      "scannerparam" => "--hosts \@HOSTS --from-cache --publish",
	      "scannername" => "SSLlabs",
	      "name" => "schubergphilis"
	   },
	   {
	      "targets" => "www.seccubus.com",
	      "scannername" => "SSLlabs",
	      "password" => "",
	      "scannerparam" => "--hosts \@HOSTS --from-cache --publish",
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
	      "issues" => [
	         "41",
	         "88"
	      ],
	      "name" => "Beast",
	      "severity" => "0",
	      "status" => "1",
	      "findings" => [],
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
	      "issues" => [
	         "136",
	         "227",
	         "272"
	      ],
	      "description" => "rc4 issue",
	      "id" => "2",
	      "ext_ref" => "rc4 ref",
	      "severity" => "0",
	      "findings" => [],
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

my @ffiles = <"/tmp/export.$$/scan_1/finding_*">;
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
	   "host" => "www.seccubus.com"
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
	   "host" => "www.seccubus.com/184.50.88.72"
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

my @ffiles = <"/tmp/export.$$/scan_2/finding_*">;
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
	      "scannerparam" => "--hosts \@HOSTS --from-cache --publish",
	      "scannername" => "SSLlabs",
	      "name" => "schubergphilis"
	   }	],
	"Scan 2 exported ok"
);

ok(! -e "/tmp/export.$$.2/scan_1", "There is no scan_1 directory");

# Prep for import
edit_workspace(100,"exported");

`rm -rf /tmp/export.$$/`;
`rm -rf /tmp/export.$$.1/`;
`rm -rf /tmp/export.$$.2/`;

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
