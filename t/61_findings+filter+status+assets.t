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
use Mojo::Base -strict;

use strict;

use lib "lib";

use Test::More;
use Test::Mojo;
use Data::Dumper;

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

my $t = Test::Mojo->new('Seccubus');

# Log in
$t->post_ok('/api/session' => { 'REMOTEUSER' => 'admin' })
    ->status_is(200,"Login ok")
;

pass("Importing ssllabs-seccubus scan");
`bin/load_ivil -w findings -s seccubus -t 20170101000000 --scanner SSLlabs testdata/ssllabs-seccubus.ivil.xml`;
is($?,0,"Import ran ok");
pass("Importing ssllabs-schubergphilis scan");
`bin/load_ivil -w findings -s schubergphilis -t 20170101000100 --scanner SSLlabs testdata/ssllabs-schubergphilis.ivil.xml`;
is($?,0,"Import ran ok");
pass("Importing ssllabs-seccubus scan, again");
`bin/load_ivil -w findings -s seccubus -t 20170101000200 --scanner SSLlabs testdata/ssllabs-seccubus.ivil.xml`;
is($?,0,"Import ran ok");
pass("Importing nmap scan");
`bin/load_ivil -w findings -s nmap -t 20170101000300 --scanner NMap testdata/nmap.ivil.xml`;
is($?,0,"Import ran ok");
pass("Importing filter test scan");
`bin/load_ivil -w filters -s filters -t 20170101000400 --scanner SSLlabs testdata/filter.ivil.xml`;
is($?,0,"Import ran ok");


# Should fail with non numeric workspace
$t->get_ok('/api/workspace/a/findings')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

$t->get_ok('/api/workspace/a/filters')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

$t->get_ok('/api/workspace/a/status')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

$t->get_ok('/api/workspace/a/assets')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

# Testing asset creation

# No parameters
$t->post_ok('/api/workspace/100/assets')
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

# Name missing
$t->post_ok('/api/workspace/100/assets',
    json => {
        hosts => "localhost",
        recipients => "root\@example.com"
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

# Should get empty list
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([])
;

# ok
$t->post_ok('/api/workspace/100/assets',
    json => {
        name => "localhost",
        hosts => "localhost",
        recipients => "root\@example.com"
    })
    ->status_is(200)
    ->json_is({
        id => 1,
        name => "localhost",
        hosts => "localhost",
        recipients => "root\@example.com",
        workspace => 100,
    })
;

# Should list with single item
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([{
        id => 1,
        name => "localhost",
        hosts => "localhost",
        recipients => "root\@example.com",
        recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
        workspace => 100,
    }])
;

# duplicate
$t->post_ok('/api/workspace/100/assets',
    json => {
        name => "localhost",
        hosts => "localhost",
        recipients => "root\@example.com"
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# Should list with single item
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([{
        id => 1,
        name => "localhost",
        hosts => "localhost",
        recipients => "root\@example.com",
        recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
        workspace => 100,
    }])
;

# add more
$t->post_ok('/api/workspace/100/assets',
    json => {
        name => "v2",
        hosts => "v2.seccubus.com",
        recipients => "root\@example.com"
    })
    ->status_is(200)
    ->json_is({
        id => 2,
        name => "v2",
        hosts => "v2.seccubus.com",
        recipients => "root\@example.com",
        workspace => 100,
    })
;

# Should list with two items
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([
        {
            id => 1,
            name => "localhost",
            hosts => "localhost",
            recipients => "root\@example.com",
            recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
            workspace => 100,
        },
        {
            id => 2,
            name => "v2",
            hosts => "v2.seccubus.com",
            recipients => "root\@example.com",
            recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
            workspace => 100,
        }
    ])
;

# Updating assets

# Non numeric workspace
$t->put_ok('/api/workspace/a/asset/2',
    json => {
        name => "v3",
        hosts => "v3.seccubus.com",
        recipients => "toor\@example.com"
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

# Non numeric asset
$t->put_ok('/api/workspace/100/asset/a',
    json => {
        name => "v3",
        hosts => "v3.seccubus.com",
        recipients => "toor\@example.com"
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

# empty name
$t->put_ok('/api/workspace/100/asset/2',
    json => {
        hosts => "v3.seccubus.com",
        recipients => "toor\@example.com"
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

# Duplicate name
$t->put_ok('/api/workspace/100/asset/2',
    json => {
        name => "localhost",
        hosts => "v3.seccubus.com",
        recipients => "toor\@example.com"
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;

# Non-existant
# Duplicate name
$t->put_ok('/api/workspace/100/asset/3',
    json => {
        name => "v3",
        hosts => "v3.seccubus.com",
        recipients => "toor\@example.com"
    })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
;


# OK
$t->put_ok('/api/workspace/100/asset/2',
    json => {
        name => "v3",
        hosts => "v3.seccubus.com",
        recipients => "toor\@example.com"
    })
    ->status_is(200)
    ->json_is({
        id => 2,
        name => "v3",
        hosts => "v3.seccubus.com",
        recipients => "toor\@example.com",
        workspace => 100,
    })
;

# Should list with two items
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([
        {
            id => 1,
            name => "localhost",
            hosts => "localhost",
            recipients => "root\@example.com",
            recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
            workspace => 100,
        },
        {
            id => 2,
            name => "v3",
            hosts => "v3.seccubus.com",
            recipients => "toor\@example.com",
            recipientsHtml => '<a href="mailto:toor@example.com">toor@example.com</a>',
            workspace => 100,
        }
    ])
;

# Testing limit in findings
$t->get_ok('/api/workspace/100/findings')
    ->status_is(200)
;
is(@{$t->{tx}->res()->json()},200,"200 Elements returned");

$t->get_ok('/api/workspace/100/findings?Limit=-1')
    ->status_is(200)
;
is(@{$t->{tx}->res()->json()},324,"324 Elements returned");

# Should get no findings if scanId doesn't exist
$t->get_ok('/api/workspace/100/findings?Limit=-1&scanIds[]=54345')
    ->status_is(200)
    ->json_is([])
;

# Should get empty filter too
$t->get_ok('/api/workspace/100/filters?scanIds[]=54345')
    ->status_is(200)
    ->json_is(
        {"finding"=>"","host"=>[{"name"=>"*","number"=>0,"selected"=>0},{"name"=>"---","number"=>-1,"selected"=>0}],"hostname"=>[{"name"=>"*","number"=>0},{"name"=>"---","number"=>-1,"selected"=>0}],"issue"=>[{"name"=>"*","number"=>0},{"name"=>"---","number"=>-1,"selected"=>0}],"plugin"=>[{"name"=>"*","number"=>0},{"name"=>"---","number"=>-1,"selected"=>0}],"port"=>[{"name"=>"*","number"=>0},{"name"=>"---","number"=>-1,"selected"=>0}],"remark"=>"","severity"=>[{"name"=>"*","number"=>0},{"name"=>"---","number"=>-1,"selected"=>0}]}
    )
;

# Same for status
$t->get_ok('/api/workspace/100/status?scanIds[]=54345')
    ->status_is(200)
    ->json_is(
        [{"count"=>"0","id"=>"1","name"=>"New"},{"count"=>"0","id"=>"2","name"=>"Changed"},{"count"=>"0","id"=>"3","name"=>"Open"},{"count"=>"0","id"=>"4","name"=>"No issue"},{"count"=>"0","id"=>"5","name"=>"Gone"},{"count"=>"0","id"=>"6","name"=>"Closed"},{"count"=>"0","id"=>"99","name"=>"MASKED"}]
    )
;

# Should fetch enough findings
$t->get_ok('/api/workspace/100/findings?Limit=-1&scanIds[]=1')
    ->status_is(200)
    ;
my $scan1 = $t->{tx}->res()->json();
is(@$scan1,97,"97 Elements returned");

$t->get_ok('/api/workspace/100/findings?Limit=-1&scanIds[]=2')
    ->status_is(200)
    ;
my $scan2 = $t->{tx}->res()->json();
is(@$scan2,185,"185 Elements returned");

$t->get_ok('/api/workspace/100/findings?Limit=-1&scanIds[]=3')
    ->status_is(200)
    ;
my $scan3 = $t->{tx}->res()->json();
is(@$scan3,42,"42 Elements returned");

# Test fetching with assetIds
$t->get_ok('/api/workspace/100/findings?Limit=-1&assetIds[]=1')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},28,"28 Elements returned");
my $asset1 = $t->{tx}->res()->json();

$t->get_ok('/api/workspace/100/findings?Limit=-1&assetIds[]=2')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},0,"0 Elements returned");

$t->get_ok('/api/workspace/100/findings?Limit=-1&assetIds[]=1&assetIds[]=2')
    ->status_is(200)
    ;
is(@{$t->{tx}->res()->json()},28,"28 Elements returned");


# Testing filters with scans
my $count = {};
foreach my $f ( @$scan3 ) {
    $count->{Status}->{$f->{status}}++;
    $count->{Host}->{$f->{host}}++;
    if ( defined $f->{hostName} ) {
        $count->{HostName}->{$f->{hostName}}++;
    } else {
        $count->{HostName}->{"(blank)"}++;
    }
    $count->{Port}->{$f->{port}}++;
    $count->{Plugin}->{$f->{plugin}}++;
    $count->{Severity}->{$f->{severity}}++;
    $count->{Remark}->{$f->{remark}}++ if defined $f->{remark};
}


$count->{Status}->{98} = 0;
$count->{Host}->{bla} = 0;
$count->{HostName}->{bla} = 0;
$count->{Port}->{bla} = 0;
$count->{Plugin}->{bla} = 0;
$count->{Finding}->{bla} = 0;
$count->{Severity}->{98} = 0;
$count->{Remark}->{bla} = 0;

$count->{Status}->{'*'} = 42;
$count->{Host}->{'*'} = 42;
$count->{HostName}->{'*'} = 42;
$count->{Port}->{'*'} = 42;
$count->{Plugin}->{'*'} = 42;
$count->{Severity}->{'*'} = 42;
$count->{Finding}->{'*'} = 42;
$count->{Remark}->{'*'} = 42;

$count->{Status}->{'all'} = 42;
$count->{Host}->{'all'} = 42;
$count->{HostName}->{'all'} = 42;
$count->{Port}->{'all'} = 42;
$count->{Plugin}->{'all'} = 42;
$count->{Severity}->{'all'} = 42;
$count->{Finding}->{'all'} = 42;
$count->{Remark}->{'all'} = 42;

$count->{Status}->{'null'} = 42;
$count->{Host}->{'null'} = 42;
$count->{HostName}->{'null'} = 42;
$count->{Port}->{'null'} = 42;
$count->{Plugin}->{'null'} = 42;
$count->{Severity}->{'null'} = 42;
$count->{Finding}->{'null'} = 42;
$count->{Remark}->{'null'} = 42;

foreach my $k ( qw(Status Host HostName Port Plugin Finding Severity Remark assetIds[]) ) {
    foreach my $h ( sort keys %{$count->{$k}} ) {
        if ( $h ne "" && $h ne "(blank)") {
            $t->get_ok("/api/workspace/100/findings?Limit=-1&scanIds[]=3&$k=$h")
                ->status_is(200)
                ;
            my $finds = $t->{tx}->res()->json();
            is(@$finds,$count->{$k}->{$h},"$count->{$k}->{$h} findings for $k=$h");
            $t->get_ok("/api/workspace/100/filters?scanIds[]=3&$k=$h")
                ->status_is(200);
            if ( $k ne "Host" ) {
                $t->json_is("/host/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in host filter");
            } else {
                $t->json_is("/host/0/number", 42, "42 findings in host filter");
            }
            if ( $k ne "HostName" ) {
                $t->json_is("/hostname/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in hostname filter");
            } else {
                $t->json_is("/hostname/0/number", 42, "42 findings in hostname filter");
            }
            if ( $k ne "Port" ) {
                $t->json_is("/port/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in port filter");
            } else {
                $t->json_is("/port/0/number", 42, "42 findings in port filter");
            }
            if ( $k ne "Plugin" ) {
                $t->json_is("/plugin/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in plugin filter");
            } else {
                $t->json_is("/plugin/0/number", 42, "42 findings in plugin filter");
            }
            if ( $k ne "Severity" ) {
                $t->json_is("/severity/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in severity filter");
            } else {
                $t->json_is("/severity/0/number", 42, "42 findings in severity filter");
            }

            # Status doesn't have a status filter
            if ( $k ne "Status" ) {
                $t->get_ok("/api/workspace/100/status?scanIds[]=3&$k=$h")
                    ->status_is(200)
                    ->json_is("/0/count",$count->{$k}->{$h})
                    ->json_is("/1/count",0)
                    ->json_is("/2/count",0)
                    ->json_is("/3/count",0)
                    ->json_is("/4/count",0)
                    ->json_is("/5/count",0)
                    ->json_is("/6/count",0)
                ;
            }
        }
    }
}

# Other filter test

$t->get_ok("/api/workspace/100/filters?scanIds[]=3")
    ->status_is(200);

foreach my $k ( qw( Host HostName Port Plugin Severity ) ) {
    foreach my $f ( @{$t->{tx}->res()->json()->{lc($k)}} ) {
        if ( $f->{name} !~ /\*/ && $f->{number} != -1 ) {
            my $val = $f->{value};
            $val = $f->{name} unless defined $val and $val ne "";
            is($f->{number},$count->{$k}->{$val},"Value for $val in $k filter is correct");
            #die Dumper $count->{$k} if $k eq "Host";
        }
    }
}

# Testing filters with assets
$count = {};
foreach my $f ( @$asset1 ) {
    $count->{Status}->{$f->{status}}++;
    $count->{Host}->{$f->{host}}++;
    if ( defined $f->{hostName} ) {
        $count->{HostName}->{$f->{hostName}}++;
    } else {
        $count->{HostName}->{"(blank)"}++;
    }
    $count->{Port}->{$f->{port}}++;
    $count->{Plugin}->{$f->{plugin}}++;
    $count->{Severity}->{$f->{severity}}++;
    $count->{Remark}->{$f->{remark}}++ if defined $f->{remark};
}


$count->{Status}->{98} = 0;
$count->{Host}->{bla} = 0;
$count->{HostName}->{bla} = 0;
$count->{Port}->{bla} = 0;
$count->{Plugin}->{bla} = 0;
$count->{Finding}->{bla} = 0;
$count->{Severity}->{98} = 0;
$count->{Remark}->{bla} = 0;

$count->{Status}->{'*'} = 28;
$count->{Host}->{'*'} = 28;
$count->{HostName}->{'*'} = 28;
$count->{Port}->{'*'} = 28;
$count->{Plugin}->{'*'} = 28;
$count->{Severity}->{'*'} = 28;
$count->{Finding}->{'*'} = 28;
$count->{Remark}->{'*'} = 28;

$count->{Status}->{'all'} = 28;
$count->{Host}->{'all'} = 28;
$count->{HostName}->{'all'} = 28;
$count->{Port}->{'all'} = 28;
$count->{Plugin}->{'all'} = 28;
$count->{Severity}->{'all'} = 28;
$count->{Finding}->{'all'} = 28;
$count->{Remark}->{'all'} = 28;

$count->{Status}->{'null'} = 28;
$count->{Host}->{'null'} = 28;
$count->{HostName}->{'null'} = 28;
$count->{Port}->{'null'} = 28;
$count->{Plugin}->{'null'} = 28;
$count->{Severity}->{'null'} = 28;
$count->{Finding}->{'null'} = 28;
$count->{Remark}->{'null'} = 28;

foreach my $k ( qw(Status Host HostName Port Plugin Finding Severity Remark assetIds[]) ) {
    foreach my $h ( sort keys %{$count->{$k}} ) {
        if ( $h ne "" && $h ne "(blank)") {
            $t->get_ok("/api/workspace/100/findings?Limit=-1&assetIds[]=1&$k=$h")
                ->status_is(200)
                ;
            my $finds = $t->{tx}->res()->json();
            is(@$finds,$count->{$k}->{$h},"$count->{$k}->{$h} findings for $k=$h");
            $t->get_ok("/api/workspace/100/filters?assetIds[]=1&$k=$h")
                ->status_is(200);
            if ( $k ne "Host" ) {
                $t->json_is("/host/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in host filter");
            } else {
                $t->json_is("/host/0/number", 28, "28 findings in host filter");
            }
            if ( $k ne "HostName" ) {
                $t->json_is("/hostname/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in hostname filter");
            } else {
                $t->json_is("/hostname/0/number", 28, "28 findings in hostname filter");
            }
            if ( $k ne "Port" ) {
                $t->json_is("/port/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in port filter");
            } else {
                $t->json_is("/port/0/number", 28, "28 findings in port filter");
            }
            if ( $k ne "Plugin" ) {
                $t->json_is("/plugin/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in plugin filter");
            } else {
                $t->json_is("/plugin/0/number", 28, "28 findings in plugin filter");
            }
            if ( $k ne "Severity" ) {
                $t->json_is("/severity/0/number", $count->{$k}->{$h}, "$count->{$k}->{$h} findings in severity filter");
            } else {
                $t->json_is("/severity/0/number", 28, "28 findings in severity filter");
            }

            # Status doesn't have a status filter
            if ( $k ne "Status" ) {
                $t->get_ok("/api/workspace/100/status?assetIds[]=1&$k=$h")
                    ->status_is(200)
                    ->json_is("/0/count",$count->{$k}->{$h})
                    ->json_is("/1/count",0)
                    ->json_is("/2/count",0)
                    ->json_is("/3/count",0)
                    ->json_is("/4/count",0)
                    ->json_is("/5/count",0)
                    ->json_is("/6/count",0)
                ;
            }
        }
    }
}



# Basic
$t->get_ok("/api/workspace/101/filters")
    ->status_is(200)
    ->json_is(
        {
            "finding" => "",
            "host" => [
                {
                    "name" => "*",
                    "number" => 8,
                    "selected" => 0
                },
                {
                    "name" => "127.*",
                    "number" => 8,
                    "selected" => 0
                },
                {
                    "name" => "127.0.*",
                    "number" => 8,
                    "selected" => 0
                },
                {
                    "name" => "127.0.0.*",
                    "number" => 8,
                    "selected" => 0
                },
                {
                    "name" => "127.0.0.1",
                    "number" => 4,
                    "selected" => 0
                },
                {
                    "name" => "127.0.0.2",
                    "number" => 4,
                    "selected" => 0
                },
                {
                    "name" => "---",
                    "number" => -1,
                    "selected" => 0
                }
            ],
            "hostname" => [
                {
                    "name" => "*",
                    "number" => 8
                },
                {
                    "name" => "(blank)",
                    "number" => 4,
                    "selected" => 1,
                    "value" => ""
                },
                {
                    "name" => "localhost",
                    "number" => 4,
                    "selected" => 0
                },
                {
                    "name" => "---",
                    "number" => -1,
                    "selected" => 0
                }
            ],
            "issue" => [
                {
                    "name" => "*",
                    "number" => 8
                },
                {
                    "name" => "---",
                    "number" => -1,
                    "selected" => 0
                }
            ],
            "plugin" => [
                {
                    "name" => "*",
                    "number" => 8
                },
                {
                    "name" => "a",
                    "number" => 4,
                    "selected" => 0
                },
                {
                    "name" => "b",
                    "number" => 4,
                    "selected" => 0
                },
                {
                    "name" => "---",
                    "number" => -1,
                    "selected" => 0
                }
            ],
            "port" => [
                {
                    "name" => "*",
                    "number" => 8
                },
                {
                    "name" => "a",
                    "number" => 4,
                    "selected" => 0
                },
                {
                    "name" => "b",
                    "number" => 4,
                    "selected" => 0
                },
                {
                    "name" => "---",
                    "number" => -1,
                    "selected" => 0
                }
            ],
            "remark" => "",
            "severity" => [
                {
                    "name" => "*",
                    "number" => 8
                },
                {
                    "name" => "High",
                    "number" => 4,
                    "selected" => 0,
                    "value" => "1"
                },
                {
                    "name" => "Medium",
                    "number" => 4,
                    "selected" => 0,
                    "value" => "2"
                },
                {
                    "name" => "---",
                    "number" => -1,
                    "selected" => 0
                }
            ]
        }
    );



# Update a single finding

# Non-existant finding should fail
$t->put_ok('/api/workspace/100/finding/12345667890' => json => { status => 1 , remark => "test" })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

$t->put_ok('/api/workspace/101/finding/1' => json => { status => 1 , remark => "test" })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# Cannot set to non-existant status
$t->put_ok('/api/workspace/100/finding/1' => json => { status => 98 , remark => "test" })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# Getting a single finding


# Test all statusses
foreach my $s ( 2..6,99,1 ) {
    pass("Setting status to $s");
    # Get first
    $t->put_ok('/api/workspace/100/finding/1' => json => { status => $s } )
        ->status_is(200)
        ->json_is("/status", $s)
        ->json_is("/remark", undef)
    ;
    $t->get_ok("/api/workspace/100/status?scanIds[]=1")
        ->status_is(200)
    ;
    if ( $s == 1) {
        $t->json_is("/0/count",97);
        $t->json_is("/1/count",0);
        $t->json_is("/2/count",0);
        $t->json_is("/3/count",0);
        $t->json_is("/4/count",0);
        $t->json_is("/5/count",0);
        $t->json_is("/6/count",0);
    } else {;
        my $i = $s-1;
        $i = 6 if $i > 6;
        $t->json_is("/0/count",96);
        for my $ii ( 1..6 ) {
            if ( $ii == $i ) {
                $t->json_is("/$i/count",1);
            } else {
                $t->json_is("/$ii/count",0);
            }
        }
    }
}

# Test append and overwrite comment
$t->put_ok('/api/workspace/100/finding/1' => json => { status => 1, remark => 'bla' } )
    ->status_is(200)
    ->json_is("/status", 1)
    ->json_is("/remark", "bla")
    ;

$t->put_ok('/api/workspace/100/finding/1' => json => { status => 1, remark => 'bla' } )
    ->status_is(200)
    ->json_is("/status", 1)
    ->json_is("/remark", "bla")
    ;

$t->put_ok('/api/workspace/100/finding/1' => json => { status => 1, remark => 'bla', append => 1 } )
    ->status_is(200)
    ->json_is("/status", 1)
    ->json_is("/remark", "bla\nbla")
    ;

# Bulk updating
my $ids = [];
foreach my $f ( @$scan3 ) {
    push @$ids, $f->{id};
}
# Wrong status should fail
$t->put_ok('/api/workspace/100/findings' => json => { ids => [1,2,3] , status => 7, remark => "bla" })
    ->status_is(400)
    ->json_is('/status', 'Error')
    ->json_has('/message')
    ;

# Go through all statusses
foreach my $s ( 2..6,99,1) {
    $t->put_ok('/api/workspace/100/findings' => json => { ids => $ids, status => $s, remark => "Testing status $s" })
        ->status_is(200)
        ->json_is($ids)
        ;
    $t->get_ok('/api/workspace/100/findings?Limit=-1&scanIds[]=3')
        ->status_is(200)
        ;
    foreach my $f ( @{$t->{tx}->res()->json()} ) {
        is($f->{status},$s,"Status correctly set to $s");
        is($f->{remark},"Testing status $s","Remark correctly set");
    }
    $t->get_ok("/api/workspace/100/status?scanIds[]=3")
        ->status_is(200)
    ;
    my $i = $s-1;
    $i = 6 if $i > 6;
    for my $ii ( 0..6 ) {
        if ( $ii == $i ) {
            $t->json_is("/$i/count",42);
        } else {
            $t->json_is("/$ii/count",0);
        }
    }

}

$t->put_ok('/api/workspace/100/findings' => json => { ids => $ids, status => 1, remark => "bla", append => 1 })
    ->status_is(200)
    ->json_is($ids)
    ;
$t->get_ok('/api/workspace/100/findings?Limit=-1&scanIds[]=3')
    ->status_is(200)
    ;
foreach my $f ( @{$t->{tx}->res()->json()} ) {
    is($f->{remark},"Testing status 1\nbla","Remark correctly set");
}

# Deleting assets

# INvalid params
$t->delete_ok('/api/workspace/a/asset/2')
    ->status_is(400)
    ->json_is("/status", "Error")
    ->json_has("/message")
;

# Should list with two items
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([
        {
            id => 1,
            name => "localhost",
            hosts => "localhost",
            recipients => "root\@example.com",
            recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
            workspace => 100,
        },
        {
            id => 2,
            name => "v3",
            hosts => "v3.seccubus.com",
            recipients => "toor\@example.com",
            recipientsHtml => '<a href="mailto:toor@example.com">toor@example.com</a>',
            workspace => 100,
        }
    ])
;

$t->delete_ok('/api/workspace/100/asset/a')
    ->status_is(400)
    ->json_is("/status", "Error")
    ->json_has("/message")
;

# Should list with two items
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([
        {
            id => 1,
            name => "localhost",
            hosts => "localhost",
            recipients => "root\@example.com",
            recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
            workspace => 100,
        },
        {
            id => 2,
            name => "v3",
            hosts => "v3.seccubus.com",
            recipients => "toor\@example.com",
            recipientsHtml => '<a href="mailto:toor@example.com">toor@example.com</a>',
            workspace => 100,
        }
    ])
;

$t->delete_ok('/api/workspace/101/asset/2')
    ->status_is(400)
    ->json_is("/status", "Error")
    ->json_has("/message")
;

# Should list with two items
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([
        {
            id => 1,
            name => "localhost",
            hosts => "localhost",
            recipients => "root\@example.com",
            recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
            workspace => 100,
        },
        {
            id => 2,
            name => "v3",
            hosts => "v3.seccubus.com",
            recipients => "toor\@example.com",
            recipientsHtml => '<a href="mailto:toor@example.com">toor@example.com</a>',
            workspace => 100,
        }
    ])
;

$t->delete_ok('/api/workspace/100/asset/2')
    ->status_is(200)
    ->json_is({ id => 2 })
;


# Should list with one item
$t->get_ok('/api/workspace/100/assets')
    ->status_is(200)
    ->json_is([
        {
            id => 1,
            name => "localhost",
            hosts => "localhost",
            recipients => "root\@example.com",
            recipientsHtml => '<a href="mailto:root@example.com">root@example.com</a>',
            workspace => 100,
        }
    ])
;

done_testing();
