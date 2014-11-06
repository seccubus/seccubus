#!/usr/bin/env perl
# Copyright 2014 Frank Breedijk
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
use Test::More;

my $tests = 0;
my $pwd = `pwd`;
chomp $pwd;

my @files = split(/\n/, `cd tmp/install/seccubus/www/seccubus/json;find . -type f`);

foreach my $file ( @files ) {
	if ( $file !~ /\/\./ &&			# Skip hidden files
	     $file !~ /\.(html|css|js|ejs|3pm|gif|jpg|png|pdf|doc|xml|nbe|txt)/i
	     					# Skip know extensions
	) { #skip hidden files
		my $type = `file 'tmp/install/seccubus/www/seccubus/json/$file'`;
		chomp($type);
		if ( $type =~ /Perl/i ) {
			
			like(`(cd tmp/install/seccubus/www/seccubus/json;perl -I$pwd/t -c '$file' 2>&1)`, qr/OK/, "Perl compile test: $file");
			$tests++;
		}
	}
}
done_testing($tests);
