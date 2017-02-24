#!/usr/bin/env perl

use strict;
use warnings;

use lib 'lib';
use Mojolicious::Commands;

# Start command line interface for application
Mojolicious::Commands->start_app('Seccubus');