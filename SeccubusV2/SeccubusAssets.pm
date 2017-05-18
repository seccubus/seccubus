# ------------------------------------------------------------------------------
# Copyright 2017 Arkanoi, Frank Breedijk, Petr
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
package SeccubusAssets;

=head1 NAME $RCSfile: SeccubusAssets.pm,v $

This Pod documentation generated from the module SeccubusAssets gives a
list of all functions within the module.

=cut

use Exporter;

@ISA = ('Exporter');

@EXPORT = qw (
		create_asset
		delete_asset
		get_assets
		get_asset_id
		update_asset
		get_asset_hosts
		delete_asset_host
		create_asset_host
		update_asset_host
		get_asset2scan
		update_asset2scan
	);

use SeccubusDB;
use SeccubusRights;

sub get_asset_id($$;);
sub get_assets($;);
sub create_asset($$;$$);
sub update_asset($$$;$$);
sub delete_asset($;);

sub create_asset_host($$;$$);
sub get_asset_hosts($$;);
sub update_asset_host($;$$);
sub delete_asset_host($;);

sub get_asset2scan($;);
sub update_asset2scan($@;);

use strict;
use Carp;
use Net::IP;
use Socket;

=head1 Data manipulation - assets

=head2 get_asset_id

This function returns the id of asset with a given name in a certain workspace

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item asset_name - name of the asset

=back

=item Checks

User must be able to read workspace.

=back

=cut
sub get_asset_id($$;){
	my $workspace_id = shift or confess "No workspace_id provided";
	my $asset_name = shift or confess "No asset_name provided";
	if ( may_read($workspace_id) ) {
		return sql( "return"	=> "array",
			    "query"	=> "SELECT id from assets where name = ? and workspace_id = ?;",
			    "values"	=> [$asset_name, $workspace_id],
			  );
	} else {
		return undef;
	}

}

=head2 get_assets

This function returns a reference to an array of arrays with assets (id, name, hosts, recipients)

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=back

=item Checks

Must have at least read rights

=back

=cut

sub get_assets($;) {
	my $workspace_id = shift or confess "No workspace_id provided";
	if(! may_read($workspace_id) ) {
		return undef;
	} else {
		return sql( "return" => "ref",
		    "query"	=> "SELECT id, name, hosts, recipients, workspace_id FROM assets WHERE workspace_id = ? ORDER BY NAME",
		    "values"	=> [$workspace_id]
		);
	}
}

=head2 get_asset_hosts

This function returns a reference to an array of arrays with asset hosts (id, ip, host)

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item asset_id - id of the asset

=back

=item Checks

Must have at least read rights

=back

=cut

sub get_asset_hosts($$;) {
	my $workspace_id = shift or confess "No workspace_id provided";
	my $asset_id = shift or confess "No asset_id provided";
	return undef if(! may_read($workspace_id) );
	return sql( "return" => "ref",
	    "query"		=> "SELECT a.id, a.ip, a.host
	    				FROM asset_hosts a, assets b
	    				WHERE a.asset_id=b.id AND b.workspace_id = ? AND a.asset_id = ?
	    				ORDER BY a.id",
	    "values"	=> [$workspace_id,$asset_id]
	  );
}

=head2 create_asset

This function creates a asset with the data provided

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item asset_name - name of the asset

=item hosts - hosts of this asset (Optional)

=item recipients - recipients of this asset (Optional)

=back

=item Checks

User must be able to write workspace.

=back

=cut

sub create_asset($$;$$) {
	my $workspace_id = shift or confess "No workspace_id provided";
	my $asset_name = shift or confess "No asset_name provide to asset_id";
	my $hosts = shift;
	my $recipients = shift;
	if ( may_write($workspace_id) ) {
		if ( get_asset_id($workspace_id, $asset_name) ) {
			confess "A asset named '".$asset_name."' already exists in workspace ".$workspace_id;
		}
		my $assetid = sql( "return"	=> "id",
			    "query"	=> "INSERT into assets
			    		    SET name = ?, hosts = ?, recipients = ?, workspace_id = ?;
					   ",
			    "values"	=> [$asset_name, $hosts, $recipients, $workspace_id],
			  );
		&_set_asset_host_auto_gen($assetid,$hosts);
		return $assetid;
	} else {
		confess "Permission denied";
	}
}

=head2 _set_asset_host_auto_gen

Function for internal use only

=over 2

=item Parameters

=over 4

=item assetid - id of the asset

=item hosts - hosts of this asset (Optional)

=back

=back

=cut

sub _set_asset_host_auto_gen($;$){
	my $assetid = shift or confess "No asset Id Given";
	my $hosts = shift;
	sql( "return"	=> "handle",
	     "query"	=> " DELETE FROM asset_hosts WHERE	asset_id = ? and auto_gen=1",
	     "values"	=> [ $assetid ]
		);
	return if(!$hosts);
	$hosts =~ s/\s+-\s+/-/g;
	map {
		my $error;
		if($_ =~ /^(\d{1,3})(\.\d{1,3})(\.\d{1,3})(\.\d{1,3})-(\d{1,3})$/){
			my $left = $1.$2.$3.$4;
			my $right = $1.$2.$3.".".$5;
			$_ = $left."-".$right;
		}
		my $ipObj = new Net::IP($_) or $error = 1;
		if(!$error){
			do {
				sql("return"=>"id",
					"query"=>"INSERT into asset_hosts set asset_id=?,ip=?, auto_gen=1",
					"values"=>[$assetid,$ipObj->ip()]
				);
			} while (++$ipObj);
		} else {
			my $qname = $_;
			my ($name, $aliases, $addrtype,$length,@addrs) = gethostbyname($qname);
			if(@addrs){
				map {
					my $ip = inet_ntoa($_);
					sql("return"=>"id",
						"query"=>"INSERT into asset_hosts set asset_id=?,host=?, ip=?, auto_gen=1",
						"values"=>[$assetid,$name,$ip]
						);
					if ( $qname ne $name ) {
						sql("return"=>"id",
							"query"=>"INSERT into asset_hosts set asset_id=?,host=?, ip=?, auto_gen=1",
							"values"=>[$assetid,$qname,$ip]
							);
					}
				} @addrs;

			} else{
				warn "Address [ ".$_." ] have no resolved IP and not added.";
			}

		}
	} split /[\s\n\r,]+/, $hosts;
}

=head2 update_asset

This function updates a asset with the data provided

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=item asset_id - id of the asset

=item asset_name - name of the asset

=item hosts - hosts of this asset (Optional)

=item recipients - recipients of this asset (Optional)

=back

=item Checks

User must be able to write workspace.
The asset must exist in the workspace.

=back

=cut

sub update_asset($$$;$$) {
	my $workspace_id = shift or confess "No workspace_id provided";
	my $asset_id = shift or confess "No asset_id provided";
	my $asset_name = shift or confess "No asset_name provide to asset_id";
	my $hosts = shift;
	my $recipients = shift;

	if ( may_write($workspace_id) ) {
		my ($have) = sql("return" => "array", "query" => "select id, hosts from assets where id=? and workspace_id=?","values"=>[$asset_id,$workspace_id]);
		confess "asset_id: ".$asset_id." not exists on workspace_id: ".$workspace_id." "  if(!$have);
        my $qid = get_asset_id($workspace_id, $asset_name);
        confess "An assets with that name already exists in the workspace" if ( $qid && $qid != $asset_id );

		&_set_asset_host_auto_gen($asset_id,$hosts);
		return sql( "return"	=> "rows",
			    "query"	=> "UPDATE assets
			    		    SET name = ?, hosts = ?, recipients = ?
					    WHERE id = ? AND workspace_id = ?;
					   ",
			    "values"	=> [$asset_name, $hosts, $recipients, $asset_id, $workspace_id],
			  );
	} else {
		confess "Permission denied";
	}
}

=head2 delete_asset_host

This function deletes a asset host

=over 2

=item Parameters

=over 4

=item asset_host - id of the asset host

=back

=back

=cut

sub delete_asset_host($;){
	my $asset_host_id = shift or confess "no asset_host_id provided";
	my ($workspace_id) = sql( "return"=> "array",
		"query"	=> "SELECT	a.workspace_id
			    	FROM assets a, asset_hosts b
			    	WHERE b.asset_id = a.id AND b.id = ? ",
		"values"	=> [ $asset_host_id ]
	);

	confess "Permission denied" if (! may_write($workspace_id) );
	return sql( "return"	=> "handle",
	    "query"	=> " DELETE FROM asset_hosts WHERE	id = ?",
	    "values"	=> [ $asset_host_id ]
		);
}

=head2 delete_asset

This function deletes a asset

=over 2

=item Parameters

=over 4

=item asset - id of the asset

=back

=item Checks

User must be able to write workspace.

=back

=cut

sub delete_asset($;){
	my $asset_id = shift or confess "no asset_id provided";
	my ($workspace_id) = sql( "return"=> "array",
		"query"	=> "SELECT	a.workspace_id FROM assets a where a.id = ? ",
		"values"	=> [ $asset_id ]
	);

	confess "Permission denied" if (! may_write($workspace_id) );
	sql("return" => "handle", "query" => "DELETE FROM asset_hosts where asset_id = ?", "values"=>[$asset_id]);
	sql("return" => "handle", "query" => "DELETE FROM asset2scan where asset_id = ?", "values"=>[$asset_id]);
	return sql( "return"	=> "handle",
	    "query"	=> " DELETE FROM assets WHERE id = ?",
	    "values"	=> [ $asset_id ]
		);
}


=head2 create_asset_hosts

This function creates asset host

=over 2

=item Parameters

=over 4

=item workspace_id - id of the workspace

=asset_id- asset id

=item ip - IP of the asset (optional)

=item name - host name of the asset (optional)

=back

=item Checks

User must be able to write workspace.
workspace id need to be equal with asset workspace id

=back

=cut
sub create_asset_host($$;$$){
	my $workspace_id = shift or confess "no workspace_id provided";
	my $asset_id = shift or confess "no asset_id provided";
	my $ip = shift;
	my $host = shift;

	confess "no IP or host provided" if(!$ip && ! $host );
	if($host && ! $ip){
		my ($name, $aliases, $addrtype,$length,@addrs) = gethostbyname($host);
		if(@addrs){ map { $ip = inet_ntoa($_); } @addrs; }
	}
	confess "Permission denied" if (! may_write($workspace_id) );
	my ($checkWSId) = sql(
			"return"	=> "array",
			"query"		=> "SELECT	a.workspace_id
							FROM assets a
							WHERE a.id = ?",
			"values"	=> [ $asset_id ]
		);
	confess "Permission denied"  if( $checkWSId ne $workspace_id);
	return sql (
		"return"	=> "id",
		"query" 	=> "INSERT INTO asset_hosts
						SET ip=?, host=?, asset_id=?, auto_gen=0",
		"values"	=> [$ip,$host,$asset_id]
	);
}

=head2 update_asset_host

This function edits asset host

=over 2

=item Parameters

=over 4

=item host_id - id of the workspace

=item ip - IP of the asset (optional)

=item name - host name of the asset (optional)

=back

=item Checks

User must be able to write workspace.
workspace id need to be equal with asset workspace id

=back

=cut
sub update_asset_host($;$$){
	my $host_id = shift or confess "no host_id provided";
	my $ip = shift;
	my $host = shift;
	confess "no IP or host provided" if(!$ip && ! $host );
	if($host && ! $ip){
		my ($name, $aliases, $addrtype,$length,@addrs) = gethostbyname($host);
		if(@addrs){ map { $ip = inet_ntoa($_); } @addrs; }
	}
	my ($workspace_id) = sql(
			"return"	=> "array",
			"query"		=> "SELECT	a.workspace_id
						    FROM assets a, asset_hosts b
						    WHERE b.asset_id = a.id AND b.id = ? ",
			"values"	=> [ $host_id ]
	);
	confess "Permission denied" if (! may_write($workspace_id) );
	return sql (
		"return"	=> "rows",
		"query" 	=> "UPDATE asset_hosts
						SET ip=?, host=?, auto_gen=0
						WHERE id=?",
		"values"	=> [$ip,$host,$host_id]
	);
}


=head2 get_asset2scan

This function selects asset scans

=over 2

=item Parameters

=over 4

=item scan_id - id of the scan

=back

=back

=cut
sub get_asset2scan($;){
	my $scan_id = shift or confess "no scan_id provided";
	my ($workspace_id) = sql(
		"return"	=> "array",
		"query" 	=> "SELECT	a.workspace_id FROM scans a where a.id = ? ",
		"values" 	=> [ $scan_id ]
	);
	confess "Permission denied" if (! may_write($workspace_id) );
	return sql (
		"return" 	=> "ref",
		"query" 	=> "SELECT a.scan_id,a.asset_id
						FROM asset2scan a
						WHERE a.scan_id=?",
		"values" => [$scan_id]);
}

=head2 update_asset2scan

This function edits asset scans

=over 2

=item Parameters

=over 4

=item scan_id - id of the scan

=item array selected assets - ids of assets

=back

=back

=cut
sub update_asset2scan($@;){
	my $scan_id = shift or confess "no scan_id provided";
	my @assets = @_;
	my ($workspace_id) = sql(
		"return"	=> "array",
		"query"		=> "SELECT	a.workspace_id FROM scans a where a.id = ? ",
		"values"	=> [ $scan_id ]
	);
	confess "Permission denied" if (! may_write($workspace_id) );
	sql("return" 	=> "rows",
		"query" 	=> "DELETE FROM asset2scan
						WHERE scan_id=?",
		"values" => [$scan_id]
	);
	my @ids = ();
	map {
		my $id = sql (
			"return"	=> "id",
			"query" 	=> "insert into asset2scan set scan_id=?, asset_id=?",
			"values" 	=> [$scan_id, $_]
		);
		push @ids,$id;
	} @assets;
	return @ids
}

1;
