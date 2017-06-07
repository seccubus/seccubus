#/usr/bin/perl
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
use ExtUtils::MakeMaker;
use strict;

WriteMakefile (
	NAME		                        => "Seccubus",
	VERSION_FROM                        => "SeccubusV2.pm",
	PREREQ_PM	=> {
				'Algorithm::Diff'       => 1.15,
				'Carp'                  => 1.04,
                'Date::Format'          => 0.01,
                'Exporter'              => 5.58,
				'ExtUtils::MakeMaker'   => 6.30,
				'Getopt::Long'          => 2.35,
				'LWP::UserAgent'        => 2.0,
				'DBI'                   => 1.58,
				'DBD::mysql'            => 0.1,
				'Data::Dumper'          => 2.12,
				'XML::Simple'           => 2.17,
				'HTML::Entities'        => 1.35,
				'LWP::Simple'           => 1.41,
				'LWP::Protocol::https'  => 0.1,
				'MIME::Base64'          => 3.07,
				'JSON'                  => 2.0,
				'File::Basename'        => 0.1,
				'Socket'                => 0.1,
				'Net::SMTP'             => 0.1,
				'Net::IP'               => 1.0,
				'Mojolicious'           => '7.26',
                'Crypt::PBKDF2'         => '0.15',
                'DBD::mysql'            => '4.0',
                'Term::ReadKey'         => 0.1,
                'Mojolicious::Plugin::AccessLog'
                                        => '0.01',
			},
	NO_MYMETA	=> 1
);

package MY;
sub install {
	return "install :: all
			echo \"!! Please run install.pl to finish the installation !!\"";
}
