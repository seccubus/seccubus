#!/bin/bash
# Copyright 2018 Frank Breedijk
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

# Use this file to build a debian package locally. Make sure you are in the deb directory!

docker-compose up -d
docker-compose exec fedora26 bash -c "cd /root/project;dnf install -y build/seccubus*fc26*rpm"
docker-compose exec fedora26 bash -c "cd /opt/seccubus;hypnotoad seccubus.pl;echo -n >>/dev/tcp/localhost/8443"
docker-compose exec fedora27 bash -c "cd /root/project;dnf install -y build/seccubus*fc27*rpm"
docker-compose exec fedora27 bash -c "cd /opt/seccubus;PERL5LIB=$PERL5LIB:. hypnotoad seccubus.pl;echo -n >>/dev/tcp/localhost/8443"
docker-compose exec fedora28 bash -c "cd /root/project;dnf install -y build/seccubus*fc28*rpm"
docker-compose exec fedora28 bash -c "cd /opt/seccubus;PERL5LIB=$PERL5LIB:. hypnotoad seccubus.pl;echo -n >>/dev/tcp/localhost/8443"
docker-compose exec fedora29 bash -c "cd /root/project;dnf install -y build/seccubus*fc29*rpm"
docker-compose exec fedora29 bash -c "cd /opt/seccubus;PERL5LIB=$PERL5LIB:. hypnotoad seccubus.pl;echo -n >>/dev/tcp/localhost/8443"
docker-compose exec centos7 bash -c "cd /root/project;yum -y install epel-release;yum install -y build/perl*rpm build/seccubus*el7*rpm"
docker-compose exec centos7 bash -c "cd /opt/seccubus;hypnotoad seccubus.pl;echo -n >/dev/tcp/localhost/8443"

if [ $? == 0 ] ; then
    echo "Done building, shutting down docker image in 10 secoonds..."
    sleep 10
    docker-compose down
fi
exit;
