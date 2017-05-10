# ------------------------------------------------------------------------------
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
package Seccubus::Controller::Sql;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use lib "..";
use SeccubusV2;
use SeccubusCustomSQL;
use Data::Dumper;

# Create
sub create {
	my $self = shift;

    my $sql = $self->req->json();

    unless ( $sql->{name} ) {
        $self->error("Parameter name is missing");
        return;
    }

    unless ( $sql->{sql} ) {
        $self->error("Parameter sql is missing");
        return;
    }


    eval {
        my $new = set_customsql($sql->{name},$sql->{sql});
        my $newsql = {};
        $newsql->{id} = $$new[0];
        $newsql->{sql} = $sql->{sql};
        $newsql->{name} = $sql->{name};
        $self->render( json => $newsql );
    } or do {
        $self->error(join "\n", $@);
    };


}

# Read
sub read {
	my $self = shift;

}

# List
sub list {
	my $self = shift;

	my $workspace_id = $self->param('workspace_id');
	my $scan_id = $self->param('scan_id');

	eval {
		my $data = get_savedsql();

		$self->render( json => $data );
	} or do {
		$self->error(join "\n", $@);
	};
}

sub update {
	my $self = shift;

    my $id = $self->param("sql_id");

    my $sql = $self->req->json();

    unless ( $sql->{name} ) {
        $self->error("Parameter name is missing");
        return;
    }

    unless ( $sql->{sql} ) {
        $self->error("Parameter sql is missing");
        return;
    }


    eval {
        my $new = set_customsql($sql->{name},$sql->{sql},$id);
        $self->render( json => $new );

    } or do {
        $self->error(join "\n", $@);
    };


}

sub execute {
    my $self = shift;

    my $sql = $self->req->json();

    unless ( $sql->{sql} ) {
        $self->error("Parameter sql is missing");
        return;
    }


    eval {
        my $data = get_customsql($sql->{sql});
        $self->render( json => $data );

    } or do {
        $self->error(join "\n", $@);
    };
}


#sub delete {
#	my $self = shift;
#
#}

1;
