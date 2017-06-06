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
#FROM debian:jessie
FROM perl:5
MAINTAINER fbreedijk@schubergphilis.com

RUN apt-get update && apt-get upgrade -y
RUN \
    (echo 'mysql-server mysql-server/root_password password dwofMVR8&E^#3owHA0!Y' | debconf-set-selections ) && \
    (echo 'mysql-server mysql-server/root_password_again password dwofMVR8&E^#3owHA0!Y' | debconf-set-selections )
RUN apt-get install default-jre-headless mysql-server dnsutils nmap nginx -y
RUN cpanm --notest DBD::mysql Mojolicious Net::IP JSON DBI HTML::Entities Crypt::PBKDF2 \
    Algorithm::Diff XML::Simple LWP::Simple LWP::Protocol::https LWP::UserAgent\
    Date::Format Term::ReadKey

# cronie

RUN mkdir -p /build/seccubus
#COPY  . /build/seccubus/
COPY bin /build/seccubus/bin
COPY db /build/seccubus/db
COPY docs /build/seccubus/docs
COPY etc /build/seccubus/etc
COPY jmvc /build/seccubus/jmvc
COPY lib /build/seccubus/lib
COPY scanners /build/seccubus/scanners
COPY build_all build_jmvc install.pl Makefile.PL seccubus.pl SeccubusV2.pm /build/seccubus/

COPY docker-install.sh /tmp/install.sh
RUN bash -x /tmp/install.sh && rm /tmp/install.sh

COPY docker-files /
COPY README.md /

ENTRYPOINT ["/entrypoint.sh"]
VOLUME [ "/opt/seccubus/data" ]

EXPOSE 80
expose 443
