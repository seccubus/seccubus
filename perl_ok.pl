#!/usr/bin/env perl
# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# This little script checks all files te see if they are perl files and if so 
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
