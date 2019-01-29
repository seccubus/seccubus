# ------------------------------------------------------------------------------
# Copyright 2017-2019 Frank Breedijk, Glen Hinkle
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
use Data::Dumper;
use Cwd 'cwd';


# This method will run once at server start
sub startup {
    my $self = shift;
    my $config = shift;

    # Set an alternative controller class to set some global headers
    #$self->controller_class('Seccubus::Controller');

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

    # Setup logging
    $cfg->{paths}->{logdir} = "log" unless $cfg->{paths}->{logdir};
    if ( $self->app->mode() eq "production" ) {
        $self->app->log( Mojo::Log->new(  path => $cfg->{paths}->{logdir} . "/production.log", level => 'info' ) );
    }

    # Rewrite baseurl if we need it...
    my $baseurl = $cfg->{http}->{baseurl};
    if (  $baseurl ) {
        $self->app->hook(before_dispatch => sub {
            my $c = shift;
            my $path = $c->req->url->path;
            $path->{path} =~ s/^\/?$baseurl\/*//;
            $c->req->url->path($path);
        });
    }

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

    # CSRF protection and cookies
    $self->hook(before_routes => sub {
        my $c = shift;

        my $req = $c->req();

        # Set up cookies
        $self->session(expiration => 900);

        if ( $req->{method} && $req->{method} ne "GET" && $req->{method} ne "DELETE" ) {
            # GET methods are considered safe...
            # DELETE requests cannot be made with CSRF techniques
            # POST/PUT requests should be application/json which cannot be generated with CSRF techniques
            # without violating same-origin policies
            if (
                ( ! $req->{content}->{headers}->header('content-type') ) ||
                $req->{content}->{headers}->header('content-type') !~ /^application\/json/
            ) {
                $self->error("CSRF protection kicked in", 500);
                return $self;
            }
        }
    });




    # Security headers
    $self->hook(after_render => sub {
        my ($c, $output, $format) = @_;

        my $res = $c->res();

        $res->headers()->header('Server' => "Seccubus v$SeccubusV2::VERSION");
        $res->headers()->header('X-Frame-Options' => 'DENY');
        $res->headers()->header('X-XSS-Protection' => "1; mode=block");
        $res->headers()->header('Cache-Control' => 'no-store, no-cache, must-revalidate');
        $res->headers()->header('X-Clacks-Overhead' => 'GNU Terry Pratchett');
    });

    # Authentication callback
    my $auth_api = $r->under( sub {
        my $c = shift;

        my $config = get_config;
        my $header_name = $config->{auth}->{http_auth_header};
        my $header_value = "";
        $header_value = $c->req->headers->header($header_name) if $header_name;
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

    # App Status
    $r->get          ('api/appstatus')->to('app_status#read');
    $r->get          ('api/appstatus/:errorcode')->to('app_status#read');

    # Assets
    $auth_api->post  ('api/workspace/:workspace_id/assets')->to('assets#create');
    $auth_api->get   ('api/workspace/:workspace_id/assets')->to('assets#list');
    $auth_api->put   ('api/workspace/:workspace_id/asset/:id')->to('assets#update');
    $auth_api->delete('api/workspace/:workspace_id/asset/:id')->to('assets#delete');

    # AssetHosts
    $auth_api->post  ('api/workspace/:workspace_id/asset/:asset_id/hosts')->to('asset_hosts#create');
    $auth_api->get   ('api/workspace/:workspace_id/asset/:asset_id/hosts')->to('asset_hosts#list');
    $auth_api->put   ('api/workspace/:workspace_id/asset/:asset_id/host/:id')->to('asset_hosts#update');
    $auth_api->delete('api/workspace/:workspace_id/asset/:asset_id/host/:id')->to('asset_hosts#delete');

    # Attachments
    $auth_api->get   ('api/workspace/:workspace_id/scan/:scan_id/run/:run_id/attachment/:id')->to('attachments#read');

    # Events
    $auth_api->get   ('api/events')->to('events#list');

    # Filter
    $auth_api->get   ('api/workspace/:workspace_id/filters')->to('filter#list');

    # Findings
    $auth_api->get   ('api/workspace/:workspace_id/findings')->to('findings#list');
    $auth_api->put   ('api/workspace/:workspace_id/finding/:id')->to('findings#update');
    $auth_api->put   ('api/workspace/:workspace_id/findings')->to('findings#blukupdate');

    # FindingHistory
    $auth_api->get   ('api/workspace/:workspace_id/finding/:finding_id/history')->to('finding_history#list');

    # Issues
    $auth_api->post  ('api/workspace/:workspace_id/issues')->to('issues#create');
    $auth_api->get   ('api/workspace/:workspace_id/issue/:id')->to('issues#read');
    $auth_api->get   ('api/workspace/:workspace_id/issues')->to('issues#list');
    $auth_api->put   ('api/workspace/:workspace_id/issue/:id')->to('issues#update');

    # IssueHistory
    $auth_api->get   ('api/workspace/:workspace_id/issue/:issue_id/history')->to('issue_history#list');

    # Notifications
    $auth_api->post  ('api/workspace/:workspace_id/scan/:scan_id/notifications')->to('notifications#create');
    $auth_api->get   ('api/workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#read');
    $auth_api->get   ('api/workspace/:workspace_id/scan/:scan_id/notifications')->to('notifications#list');
    $auth_api->put   ('api/workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#update');
    $auth_api->delete('api/workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#delete');

    # Scans
    $auth_api->post  ('api/workspace/:workspace_id/scans')->to('scans#create');
    $auth_api->get   ('api/workspace/:workspace_id/scans')->to('scans#list');
    $auth_api->get   ('api/workspace/:workspace_id/scan/:scan_id')->to('scans#read');
    $auth_api->put   ('api/workspace/:workspace_id/scan/:scan_id')->to('scans#update');
    #$auth_api->delete('api/workspace/:id/scan/:scan_id')->to('scans#delete');

    # Scanners
    $auth_api->get   ('api/scanners')->to('scanners#list');

    # Session
    $r->post         ('api/session')->to('sessions#create');
    $r->get          ('api/session')->to('sessions#read');
    $r->get          ('api/logout')->to('sessions#delete');
    $r->delete       ('api/session')->to('sessions#delete');
    $r->delete       ('api/session/:is_dir')->to('sessions#delete');

    # Severities
    $auth_api->get   ('api/severities')->to('severities#list');

    # SQL
    $auth_api->post  ('api/sql')->to('sql#create');
    $auth_api->get   ('api/sql')->to('sql#list');
    $auth_api->put   ('api/sql/:sql_id')->to('sql#update');
    $auth_api->post  ('api/sql/execute')->to('sql#execute');

    # Status
    $auth_api->get   ('api/workspace/:workspace_id/status')->to('status#list');

    # Runs
    $auth_api->get   ('api/workspace/:workspace_id/scan/:scan_id/runs')->to('runs#list');

    # Users
    $auth_api->get   ('api/users')->to('users#list');

    # Version
    $r->get          ('api/version')->to('version#read');

    # Workspace
    $auth_api->post  ('api/workspaces')->to('workspaces#create');
    $auth_api->get   ('api/workspaces')->to('workspaces#list');
    $auth_api->put   ('api/workspace/:id')->to('workspaces#update');


    # Handle file requests
    if ( $self->mode() eq 'production' ) {
        $r->get('/')->to(cb => sub {
            my $c = shift;
            $c->redirect_to("$baseurl/seccubus/seccubus.html")
        });
    } else {
        # Inspired by https://github.com/tempire/app-dirserve
        $r->get('/')->to(cb => sub {
            my $c = shift;
            $c->redirect_to("$baseurl/seccubus/seccubus.html")
        });
        $r->get('/(*dir)')->to(cb => sub {
            my $c = shift;

            my $dir = $c->param('dir');
            my $fulldir = cwd() . "/public/$dir";
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
