#!/bin/bash
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

# Use this file to build a debian package locally. Make sure you are in the deb directory!

docker-compose up -d
docker-compose exec fedora26 bash -c "dnf install -y fedora-packager fedora-review java-1.8.0-openjdk-headless \"perl(ExtUtils::MakeMaker)\" gpg rpm-sign make "
docker-compose exec fedora26 bash -c "cd /root/project;rpm/makerpm.sh"
docker-compose exec fedora27 bash -c "dnf install -y fedora-packager fedora-review java-1.8.0-openjdk-headless \"perl(ExtUtils::MakeMaker)\" gpg rpm-sign make"
docker-compose exec fedora27 bash -c "cd /root/project;rpm/makerpm.sh"
docker-compose exec fedora28 bash -c "dnf install -y fedora-packager fedora-review java-1.8.0-openjdk-headless \"perl(ExtUtils::MakeMaker)\" gpg rpm-sign make"
docker-compose exec fedora28 bash -c "cd /root/project;rpm/makerpm.sh"
docker-compose exec fedora29 bash -c "dnf install -y fedora-packager fedora-review java-1.8.0-openjdk-headless \"perl(ExtUtils::MakeMaker)\" gpg rpm-sign make"
docker-compose exec fedora29 bash -c "cd /root/project;rpm/makerpm.sh"
docker-compose exec centos7 bash -c "yum install -y java-1.8.0-openjdk-headless \"perl(ExtUtils::MakeMaker)\" gpg rpm-sign git rpm-build make \"perl(Test::Simple)\" \"perl(CPAN)\" expect perl-LWP-Protocol-https"
docker-compose exec centos7 bash -c "cd /root/project;rpm/makerpm.sh"

if [ $? == 0 ] ; then
    echo "Done building, shutting down docker image in 10 secoonds..."
    sleep 10
    docker-compose down
fi
exit;
