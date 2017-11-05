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
docker-compose exec fedora26 bash -c "dnf install -y fedora-packager fedora-review java-1.8.0-openjdk \"perl(ExtUtils::MakeMaker)\" gpg rpm-sign"
docker-compose exec fedora26 bash -c "cd /root/project;rpm/makerpm.sh"
docker-compose exec fedora25 bash -c "dnf install -y fedora-packager fedora-review java-1.8.0-openjdk \"perl(ExtUtils::MakeMaker)\" gpg rpm-sign"
docker-compose exec fedora25 bash -c "cd /root/project;rpm/makerpm.sh"

#if [ $? == 0 ] ; then
#    echo "Done building, shutting down docker image in 10 secoonds..."
#    sleep 10
#    docker-compose down
#fi
exit;
