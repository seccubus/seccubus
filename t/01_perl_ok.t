#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# This little script checks all files te see if they are perl files and if so 
# ------------------------------------------------------------------------------

use strict;
use Test::More;

my $tests = 0;

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
			if ( $file !~ qr|^./www/| ) { # Exclude www directory
				isnt(`grep 'use strict;' '$file'`, '', "$file contains 'use strict'");
				$tests++;
			
				like(`perl -ISeccubusV2 -It -c '$file' 2>&1`, qr/OK/, "$file perl compile test");
				$tests++;
			}
		}
	}
}
done_testing($tests);
