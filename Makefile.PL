#/usr/bin/perl
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
use ExtUtils::MakeMaker;
use strict;

WriteMakefile (
	NAME		=> "Seccubus",
	VERSION_FROM	=> "SeccubusV2.pm",
	PREREQ_PM	=> {
				'Algorithm::Diff'		=> 1.15,
				'Carp'					=> 1.04,
                'CGI'					=> 3.43,
                'CGI::Carp'				=> 0.01,
                'Exporter'				=> 5.58,
				'ExtUtils::MakeMaker'	=> 6.30,
				'Getopt::Long'			=> 2.35,
				'IPC::Open2'			=> 1.02,
				'LWP::UserAgent'		=> 2.0,
				'DBI'					=> 1.58,
				'Data::Dumper'			=> 2.12,
				'XML::Simple'			=> 2.17,
				'HTML::Entities'		=> 1.35,
				'LWP::Simple'			=> 1.41,
				'MIME::Base64'			=> 3.07,
				'JSON'					=> 2.0,
				'File::Basename'		=> 0.1,
				'Socket'				=> 0.1,
				'Net::SMTP'				=> 0.1,
				'HTML::TreeBuilder'		=> 0.1,
				'REST::Client'			=> 0.1,
				'Net::IP'				=> 1.0
			},
	PM		=> { 
				'SeccubusV2.pm'				=> '$(INST_LIBDIR)/SeccubusV2.pm',
				'SeccubusV2/IVIL.pm'			=> '$(INST_LIBDIR)/IVIL.pm',
				'SeccubusV2/SeccubusRights.pm'		=> '$(INST_LIBDIR)/SeccubusV2/SeccubusRights.pm',
				'SeccubusV2/SeccubusDB.pm'		=> '$(INST_LIBDIR)/SeccubusDB.pm',
				'SeccubusV2/SeccubusRuns.pm'		=> '$(INST_LIBDIR)/SeccubusRuns.pm',
				'SeccubusV2/SeccubusFindings.pm'	=> '$(INST_LIBDIR)/SeccubusFindings.pm',
				'SeccubusV2/SeccubusScanners.pm'	=> '$(INST_LIBDIR)/SeccubusScanners.pm',
				'SeccubusV2/SeccubusHelpers.pm'		=> '$(INST_LIBDIR)/SeccubusHelpers.pm',
				'SeccubusV2/SeccubusScans.pm'		=> '$(INST_LIBDIR)/SeccubusScans.pm',
				'SeccubusV2/SeccubusHostnames.pm'	=> '$(INST_LIBDIR)/SeccubusHostnames.pm',
				'SeccubusV2/SeccubusUsers.pm'		=> '$(INST_LIBDIR)/SeccubusUsers.pm',
				'SeccubusV2/SeccubusIVIL.pm'		=> '$(INST_LIBDIR)/SeccubusIVIL.pm',
				'SeccubusV2/SeccubusWorkspaces.pm'	=> '$(INST_LIBDIR)/SeccubusWorkspaces.pm',
			},

);

package MY;
sub install {
	return "install :: all
			echo \"!! Please run install.pl to finish the installation !!\"";
}
