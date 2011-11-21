#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# This little script checks all files te see if they are perl files and if so 
# ------------------------------------------------------------------------------
#  Copyright 2011 Frank Breedijk of Schuberg Philis
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
# ------------------------------------------------------------------------------

use strict;

my @files = split(/\n/, `find . -type f`);

foreach my $file ( @files ) {
	if ( $file !~ /\/\./ &&			# Skip hidden files
	     $file !~ /tmp/ &&			# Skip temp files
	     $file !~ /\.\/blib\// &&		# Skip blib directory
	     $file !~ /\.(html|css|js|ejs|3pm|gif|jpg|png|pdf|doc|xml|nbe|txt)/i
	     					# Skip know extensions
	) { #skip hidden files
		my $type = `file '$file'`;
		chomp($type);
		if ( $type =~ /Perl/i ) {
			print "$file.";
			if (! `grep 'use strict;' '$file'`) {
				print "nok\n";
				die("$file does not contain 'use strict;'\n");
			}
			print ".";
			my $compile = `perl -ISeccubusV2 -c '$file' 2>&1`;
			if ( $compile !~ /OK/) {
				print "nok\n";
				die("$file contains perl compile error:\n$compile\n");
			} else {
				print "ok\n";
			}
		}
	}
}
