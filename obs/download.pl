#!/usr/bin/env perl

use strict;
use LWP::Simple;

my $repos=`(cd */*;osc results|awk '{print \$1 }'|sort -u)`;
foreach my $platform (split/\n/, $repos) {
	print "$platform\n";

	my $dir = get("http://download.opensuse.org/repositories/home:/seccubus/$platform");
	while ( $dir =~ s/.*?<a href="(.[a-z0-9]*?\/)"// ) {
		my $dir = $1;
		if ( $dir !~ /^repo/ ) {
			my $file = "";
			my $dist = get("http://download.opensuse.org/repositories/home:/seccubus/$platform/$dir");
			while ( $dist =~ s/<a href="(Seccubus[a-zA-Z0-9\.\-]*?\.rpm)"// ) {
				$file = $1;
			}
			print "$dir - $file\n";
			if ( ! -e $file ) {
				my $blob = get("http://download.opensuse.org/repositories/home:/seccubus/$platform/$dir/$file");
				open(FILE, ">$file");
				print FILE $blob;
				close FILE;
			}
		}
	}

	#my $xml = get("https://api.opensuse.org/build/home:seccubus/$platform/$platform/Seccubus/");
	#my $xml = XMLin(get("https://api.opensuse.org/build/home:seccubus/$platform/$platform/Seccubus/"));
	#die $xml;
	
}

