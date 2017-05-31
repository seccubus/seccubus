# ------------------------------------------------------------------------------
# Copyright 2017 Frank Breedijk, Glen Hinkle
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
package Seccubus;
use Mojo::Base 'Mojolicious';

use strict;

use SeccubusV2;
use Seccubus::Users;
use Seccubus::Controller;
use Data::Dumper;
use Cwd 'cwd';


# This method will run once at server start
sub startup {
    my $self = shift;
    my $config = shift;

    my $cfg = get_config();

    my $listen = "http://*:" . $cfg->{http}->{port};
    if ( $cfg->{http}->{cert} && $cfg->{http}->{key} && -e $cfg->{http}->{cert} && -e $cfg->{http}->{key}) {
        $listen = "https://*:" . $cfg->{http}->{port} . "?cert=" . $cfg->{http}->{cert} . "&key=" . $cfg->{http}->{key};
    }

    # Setup listeing
    $self->app->config(
        hypnotoad => {
            listen => [ $listen ]
        }
    );

    # Set an alternative controller class to set some global headers
    $self->controller_class('Seccubus::Controller');

    # Session Security
    my $sessionkey = $config->{auth}->{sessionkey};
    $sessionkey = 'SeccubusScanSmarterNotHarder' unless $sessionkey;
    $self->secrets([$sessionkey]);

    # Set up error helper
    $self->helper( error => sub {
        my ($self, $message, $status ) = @_;

        $status = 400 unless $status;
        $message = "error" unless $message;

        $self->render(
            json => {
                status => "Error",
                message => $message,
            },
            status => $status
        );
    });


    # Router
    my $r = $self->routes;

    # Authentication callback
    my $auth_api = $r->under( sub {
        my $c = shift;

        my $config = get_config;
        my $header_name = $config->{auth}->{http_auth_header};
        my $header_value = $c->req->headers->header($header_name);
        my $u = $c->session->{user};

        if ( ( $self->app->mode() eq "production" && $header_name ) || ( $self->app->mode() eq "development" && $header_value ) ) {
            ( $ENV{SECCUBUS_USER} ) = get_login($header_value);
            return 1;
        } elsif ( $u && check_password($u->{name},undef,$u->{hash}) ) {
            $ENV{SECCUBUS_USER} = $u->{name};
            return 1;
        } else {
            $ENV{SECCUBUS_USER} = "";
            $c->error("User is not authenticated",403);
            return 0;
        }
    });

    my $auth_gui = $r->under( sub {
        my $c = shift;

        my $config = get_config;
        my $header_name = $config->{auth}->{http_auth_header};
        my $header_value = $c->req->headers->header($header_name);
        my $u = $c->session->{user};

        if ( ( $self->app->mode() eq "production" && $header_name ) || ( $self->app->mode() eq "development" && $header_value ) ) {
            ( $ENV{SECCUBUS_USER} ) = get_login($header_value);
            return 1;
        } elsif ( $u && check_password($u->{name},undef,$u->{hash}) ) {
            $ENV{SECCUBUS_USER} = $u->{name};
            return 1;
        } else {
            $ENV{SECCUBUS_USER} = "";
            $c->redirect_to("seccubus/login.html");
            return 0;
        }
    });

    # App Status
    $r->get   ('appstatus')->to('app_status#read');
    $r->get   ('appstatus/:errorcode')->to('app_status#read');

    # Assets
    $auth_api->post  ('workspace/:workspace_id/assets')->to('assets#create');
    $auth_api->get   ('workspace/:workspace_id/assets')->to('assets#list');
    $auth_api->put   ('workspace/:workspace_id/asset/:id')->to('assets#update');
    $auth_api->delete('workspace/:workspace_id/asset/:id')->to('assets#delete');

    # AssetHosts
    $auth_api->post  ('workspace/:workspace_id/asset/:asset_id/hosts')->to('asset_hosts#create');
    $auth_api->get   ('workspace/:workspace_id/asset/:asset_id/hosts')->to('asset_hosts#list');
    $auth_api->put   ('workspace/:workspace_id/asset/:asset_id/host/:id')->to('asset_hosts#update');
    $auth_api->delete('workspace/:workspace_id/asset/:asset_id/host/:id')->to('asset_hosts#delete');

    # Attachments
    $auth_api->get   ('workspace/:workspace_id/scan/:scan_id/run/:run_id/attachment/:id')->to('attachments#read');

    # Events
    $auth_api->get   ('events')->to('events#list');

    # Filter
    $auth_api->get   ('workspace/:workspace_id/filters')->to('filter#list');

    # Findings
    $auth_api->get   ('workspace/:workspace_id/findings')->to('findings#list');
    $auth_api->put   ('workspace/:workspace_id/finding/:id')->to('findings#update');
    $auth_api->put   ('workspace/:workspace_id/findings')->to('findings#blukupdate');

    # FindingHistory
    $auth_api->get   ('workspace/:workspace_id/finding/:finding_id/history')->to('finding_history#list');

    # Issues
    $auth_api->post  ('workspace/:workspace_id/issues')->to('issues#create');
    $auth_api->get   ('workspace/:workspace_id/issues')->to('issues#list');
    $auth_api->put   ('workspace/:workspace_id/issue/:id')->to('issues#update');

    # IssueHistory
    $auth_api->get   ('workspace/:workspace_id/issue/:issue_id/history')->to('issue_history#list');

    # Notifications
    $auth_api->post  ('workspace/:workspace_id/scan/:scan_id/notifications')->to('notifications#create');
    $auth_api->get   ('workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#read');
    $auth_api->get   ('workspace/:workspace_id/scan/:scan_id/notifications')->to('notifications#list');
    $auth_api->put   ('workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#update');
    $auth_api->delete('workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#delete');

    # Scans
    $auth_api->post  ('workspace/:workspace_id/scans')->to('scans#create');
    $auth_api->get   ('workspace/:workspace_id/scans')->to('scans#list');
    $auth_api->get   ('workspace/:workspace_id/scan/:scan_id')->to('scans#read');
    $auth_api->put   ('workspace/:workspace_id/scan/:scan_id')->to('scans#update');
    #$auth_api->delete('workspace/:id/scan/:scan_id')->to('scans#delete');

    # Scanners
    $auth_api->get   ('scanners')->to('scanners#list');

    # Session
    $r->post  ('session')->to('sessions#create');
    $r->get   ('session')->to('sessions#read');
    $r->get   ('logout')->to('sessions#delete');
    $r->delete('session')->to('sessions#delete');
    $r->delete('session/:is_dir')->to('sessions#delete');

    # Severities
    $auth_api->get   ('severities')->to('severities#list');

    # SQL
    $auth_api->post  ('sql')->to('sql#create');
    $auth_api->get   ('sql')->to('sql#list');
    $auth_api->put   ('sql/:sql_id')->to('sql#update');
    $auth_api->post  ('sql/execute')->to('sql#execute');

    # Status
    $auth_api->get   ('workspace/:workspace_id/status')->to('status#list');

    # Runs
    $auth_api->get   ('workspace/:workspace_id/scan/:scan_id/runs')->to('runs#list');

    # Version
    $auth_api->get   ('version')->to('version#read');

    # Workspace
    $auth_api->post  ('workspaces')->to('workspaces#create');
    $auth_api->get   ('workspaces')->to('workspaces#list');
    #$auth_api->get('workspace/:id')->to('workspaces#read');
    $auth_api->put   ('workspace/:id')->to('workspaces#update');
    #$auth_api->delete('workspace/:id')->to('workspaces#delete');


    # Handle file requests
    if ( $self->mode() eq 'production' ) {
        $auth_gui->get('/seccubus')->to(cb => sub {
            my $c = shift;
            $c->redirect_to('seccubus/seccubus.html')
        });
        $auth_gui->get('/')->to(cb => sub {
            my $c = shift;
            $c->redirect_to('seccubus')
        });
    } else {
        # Inspired by https://github.com/tempire/app-dirserve
        $auth_gui->get('/')->to(cb => sub {
            my $c = shift;
            $c->redirect_to('seccubus')
        });
        $auth_gui->get('/Seccubus')->to(cb => sub {
            my $c = shift;
            $c->redirect_to('seccubus/seccubus.html')
        });
        $r->get('/(*dir)')->to(cb => sub {
            my $c = shift;

            my $dir = $c->param('dir');
            my $fulldir = cwd() . "/jmvc/$dir";
            if ( -d $fulldir ) {
                opendir DH, $fulldir;
                my @items = map +{ name => $_, is_dir => -d "$fulldir/$_"}, readdir DH;
                close DH;

                $c->stash(
                    dir     => $dir,
                    fulldir => $fulldir,
                    items   => \@items
                );

                $c->render('listing');
            } else {
                $c->render(
                    message => "File not found",
                    status => 404
                );
            }
        });
    }

}


1;
