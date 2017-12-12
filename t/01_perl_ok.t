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
use Test::More;
use Perl::Critic;

my $critic = Perl::Critic->new(-severity => 5);

my @files = sort split(/\n/, `find . -type f`);

my $no_critic = {
    "./lib/OpenVAS/OMP.pm" => "Third party file"
};

foreach my $file ( @files ) {
	if ( $file !~ /\/\./ &&            # Skip hidden files
	     $file !~ /tmp/ &&             # Skip temp files
	     $file !~ /\.\/blib\// &&      # Skip blib directory
	     $file !~ /\.(html|css|js|ejs|3pm|gif|jpg|png|pdf|doc|xml|nbe|txt)/i &&
                                       # Skip know extensions
         $file !- /\.build\//          # Skip build directory
	) {                                #skip hidden files
		my $type = `file '$file'`;
		chomp($type);
		if ( $type =~ /Perl/i ) {
			if ( $file !~ qr|^./www/| ) { # Exclude www directory
				isnt(`grep 'use strict;' '$file'`, '', "$file contains 'use strict'");

				like(`perl -c '$file' 2>&1`, qr/OK/, "Perl compile test: $file");

                my @violations = $critic->critique($file);
                unless ( $no_critic->{$file} ) {
                    is(@violations,0,"perlcritic $file : " . join "", @violations);
                }

				if ( $file =~ /\.pm$/ ) {
					# Modules
					like(`ls -l '$file'`, qr/^\-rw\-r.\-.\-\-/, "File '$file' has the correct permissions");
				} else {
					# Executables
					like(`ls -l '$file'`, qr/^\-rwxr.x.\-./, "File '$file' has the correct permissions");
				}
			}
		}
	}
}
done_testing();
