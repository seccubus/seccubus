#
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
# This program creates users from the command line, usefull if you have not set
# up any users in the web gui, or if you are writing Seccubus and the GUI does
# not exist yet ;)
# ------------------------------------------------------------------------------
#
FROM centos:7
MAINTAINER fbreedijk@schubergphilis.com

RUN yum install -y epel-release && \
	yum update -y && \
	yum install -y perl mariadb-server "perl(Algorithm::Diff)" "perl(CGI)" "perl(CGI::Carp)" \
	"perl(DBI)" "perl(DBD::mysql)" 	"perl(Data::Dumper)" "perl(Date::Format)" "perl(HTML::Entities)" \
	"perl(JSON)" "perl(LWP::Simple)" "perl(LWP::Protocol::https)" "perl(LWP::UserAgent)" \
	"perl(Net::IP)" "perl(XML::Simple)" httpd nmap which git java-1.7.0-openjdk make \
	"perl(ExtUtils::MakeMaker)" wget cronie

RUN mkdir -p /build/seccubus
COPY . /build/seccubus/

COPY docker-install.sh /tmp/install.sh
RUN bash -x /tmp/install.sh && rm /tmp/install.sh

COPY docker-files /
COPY README.md /

ENTRYPOINT ["/entrypoint.sh"]
VOLUME [ "/opt/seccubus/data" ]

EXPOSE 80
