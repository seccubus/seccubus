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

use Seccubus::Controller;
use lib "..";
use SeccubusV2;
use Data::Dumper;
use Cwd 'cwd';

# This method will run once at server start
sub startup {
    my $self = shift;

    # Set an alternative controller class to set some global headers
    $self->controller_class('Seccubus::Controller');

    # Security
    $self->secrets(['SeccubusScanSmarterNotHarder']);

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

    # App Status
    $r->get   ('appstatus')->to('app_status#read');
    $r->get   ('appstatus/:errorcode')->to('app_status#read');

    # Assets
    $r->post  ('workspace/:workspace_id/assets')->to('assets#create');
    $r->get   ('workspace/:workspace_id/asset/:id')->to('assets#read');
    $r->get   ('workspace/:workspace_id/assets')->to('assets#list');
    $r->put   ('workspace/:workspace_id/asset/:id')->to('assets#update');
    $r->delete('workspace/:workspace_id/asset/:id')->to('assets#delete');

    # Attachments
    $r->get   ('workspace/:workspace_id/scan/:scan_id/run/:run_id/attachment/:id')->to('attachments#read');

    # Events
    $r->get   ('events')->to('events#list');

    # Filter
    $r->get   ('workspace/:workspace_id/filters')->to('filter#list');

    # Findings
    $r->get   ('workspace/:workspace_id/findings')->to('findings#list');
    $r->put   ('workspace/:workspace_id/finding/:id')->to('findings#update');
    $r->put   ('workspace/:workspace_id/findings')->to('findings#blukupdate');

    # FindingHistory
    $r->get   ('workspace/:workspace_id/finding/:finding_id/history')->to('finding_history#list');

    # Issues
    $r->post  ('workspace/:workspace_id/issues')->to('issues#create');
    $r->get   ('workspace/:workspace_id/issues')->to('issues#list');
    $r->put   ('workspace/:workspace_id/issue/:id')->to('issues#update');

    # IssueHistory
    $r->get   ('workspace/:workspace_id/issue/:issue_id/history')->to('issue_history#list');

    # Notifications
    $r->post  ('workspace/:workspace_id/scan/:scan_id/notifications')->to('notifications#create');
    $r->get   ('workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#read');
    $r->get   ('workspace/:workspace_id/scan/:scan_id/notifications')->to('notifications#list');
    $r->put   ('workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#update');
    $r->delete('workspace/:workspace_id/scan/:scan_id/notification/:id')->to('notifications#delete');

    # Scans
    $r->post  ('workspace/:workspace_id/scans')->to('scans#create');
    $r->get   ('workspace/:workspace_id/scans')->to('scans#list');
    $r->get   ('workspace/:workspace_id/scan/:scan_id')->to('scans#read');
    $r->put   ('workspace/:workspace_id/scan/:scan_id')->to('scans#update');
    #$r->delete('workspace/:id/scan/:scan_id')->to('scans#delete');

    # Scanners
    $r->get   ('scanners')->to('scanners#list');

    # Session
    $r->get   ('session')->to('sessions#read');

    # Severities
    $r->get   ('severities')->to('severities#list');

    # SQL
    $r->post  ('sql')->to('sql#create');
    $r->get   ('sql')->to('sql#list');
    $r->put   ('sql/:sql_id')->to('sql#update');
    $r->post  ('sql/execute')->to('sql#execute');

    # Status
    $r->get   ('workspace/:workspace_id/status')->to('status#list');

    # Runs
    $r->get   ('workspace/:workspace_id/scan/:scan_id/runs')->to('runs#list');

    # Version
    $r->get   ('version')->to('version#read');

    # Workspace
    $r->post  ('workspaces')->to('workspaces#create');
    $r->get   ('workspaces')->to('workspaces#list');
    #$r->get('workspace/:id')->to('workspaces#read');
    $r->put   ('workspace/:id')->to('workspaces#update');
    #$r->delete('workspace/:id')->to('workspaces#delete');


    # Handle file requests
    if ( $self->mode() eq 'production' ) {
        $r->get('/')->to(cb => sub {
            my $c = shift;
            $c->redirect_to('seccubus/seccubus.html')
        });
    } else {
        # Inspired by https://github.com/tempire/app-dirserve
        $r->get('/')->to(cb => sub {
            my $c = shift;
            $c->redirect_to('seccubus')
        });
        $r->get('/(*dir)')->to(cb => sub {
            my $c = shift;

            my $dir = $c->param('dir');
            my $fulldir = cwd() . "/public/$dir";
            if ( -e $fulldir ) {
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


    # Normal route to controller
    #$r->get('/')->to('default#welcome');
    #$r->get('/')->to(cb => sub {
    #   my $c = shift;
    #   $c->reply->static('seccubus.html')
    #});
}


1;
