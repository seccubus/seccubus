#/usr/bin/perl
# Copyright 2011-2018 Frank Breedijk
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

use ExtUtils::MakeMaker;
use strict;

WriteMakefile (
	NAME		                        => "Seccubus",
	VERSION_FROM                        => "SeccubusV2.pm",
	PREREQ_PM	=> {
				'Algorithm::Diff'       => 1.15,
                'DBI'                   => 1.58,
                'DBD::mysql'            => '4.0',
                'JSON'                  => 2.0,
                'XML::Simple'           => 2.17,
                'LWP::UserAgent'        => 2.0,
                'LWP::Simple'           => 1.41,
                'LWP::Protocol::https'  => 0.1,
                'Net::IP'               => 1.0,
                'Date::Format'          => 0.01,
                'Exporter'              => 5.58,
                'Getopt::Long'          => 2.35,
				'Data::Dumper'          => 2.12,
				'HTML::Entities'        => 1.35,
				'MIME::Base64'          => 3.07,
				'File::Basename'        => 0.1,
				'Socket'                => 0.1,
				'Net::SMTP'             => 0.1,
                'Crypt::PBKDF2'         => '0.15',
                'Term::ReadKey'         => 0.1,
                'Carp'                  => 1.04,
                'ExtUtils::MakeMaker'   => 6.30,
                'Mojolicious'           => '7.26',
                'Perl::Critic'          => 1.0,
                'Sys::Syslog'           => 0.1,
                'Crypt::PBKDF2'         => 0.15,
			},
	NO_MYMETA	=> 1,
    dist => { COMPRESS => "gzip -9", SUFFIX => '.gz' }
);

package MY;
sub install {
	return "install :: all
			echo \"!! Please run install.pl to finish the installation !!\"";
}
