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
package Seccubus::Controller::Filter;
use Mojo::Base 'Mojolicious::Controller';

use strict;

use SeccubusV2;
use Seccubus::Findings;
use Seccubus::Issues;
use Seccubus::Notifications;
use Data::Dumper;

# Create
#sub create {
#	my $self = shift;
#
#}

# Read
#sub read {
#    my $self = shift;
#
#    eval {
#        my $data;
#        ($data->{username}, $data->{valid}, $data->{isadmin}, $data->{message}) = get_login();
#
#        $self->render( json => $data );
#    } or do {
#        $self->error(join "\n", $@);
#    };
#}

# List
sub list {
    my $self = shift;

    my $workspace_id = $self->param('workspace_id');
    my $scan_ids = $self->every_param("scanIds[]");
    my $asset_ids = $self->every_param("assetIds[]");

    # Return an error if the required parameters were not passed
    if (not (defined ($workspace_id))) {
        $self->error("Parameter workspaceId is missing");
        return;
    } elsif ( $workspace_id + 0 ne $workspace_id ) {
        $self->error("WorkspaceId is not numeric");
        return;
    };

    eval {
        my %filter;
        foreach my $key ( qw( Status Host HostName Port Plugin Severity Finding Remark Severity Issue ) ) {
            if ( $self->param($key) && $self->param($key) ne "all" &&
                $self->param($key) ne "null" && $self->param($key) ne "*" )
            {
                $filter{lc($key)} = $self->param($key);
            }
        }
        my %filters = get_filters($workspace_id, $scan_ids, $asset_ids, \%filter);

        $self->render( json => \%filters );
    } or do {
        $self->error(join "\n", $@);
    };
}

#sub update {
#	my $self = shift;
#
#}

#sub delete {
#	my $self = shift;
#
#}

1;
