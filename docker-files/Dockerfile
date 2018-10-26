#
# Copyright 2017-2018 Frank Breedijk, Stephen Hoekstra, Daniele Bonomi
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
FROM alpine:3.8 as build

RUN mkdir -p /build/seccubus/docker-files
COPY bin /build/seccubus/bin
COPY db /build/seccubus/db
COPY docs /build/seccubus/docs
COPY etc /build/seccubus/etc
COPY jmvc /build/seccubus/jmvc
COPY lib /build/seccubus/lib
COPY scanners /build/seccubus/scanners
COPY build_all build_jmvc install.pl Makefile.PL seccubus.pl SeccubusV2.pm ChangeLog.md LICENSE.txt NOTICE.txt README.md README-docker.md /build/seccubus/
COPY docker-files/build-seccubus.sh /build/seccubus/docker-files
RUN cd /build/seccubus;./docker-files/build-seccubus.sh
COPY docker-files/install-seccubus.sh  /build/seccubus/build/docker-files/

FROM alpine:3.8

MAINTAINER fbreedijk@schubergphilis.com


COPY --from=build /build/seccubus/build /build/seccubus/build
ARG BUILDSTACK=full
RUN /build/seccubus/build/docker-files/install-seccubus.sh ${BUILDSTACK}
COPY docker-files /docker
RUN sed -i.bak "s#%BUILDSTACK%#${BUILDSTACK}#" /docker/entrypoint.sh
ENTRYPOINT ["/docker/entrypoint.sh"]
VOLUME [ "/opt/seccubus/data" ]

EXPOSE 80
EXPOSE 443

ARG BUILD_DATE
ARG VCS_REF
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-url="https://github.com/schubergphilis/Seccubus.git" \
      org.label-schema.vcs-ref=$VCS_REF \
      maintainer="Frank Breedijk"
