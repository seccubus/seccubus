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
docker-compose exec debian9 bash -c "apt-get update;apt-get install -y build-essential debhelper default-jre-headless git"
docker-compose exec debian9 bash -c "cd /root/project;deb/makedeb.sh"

if [ $? == 0 ] ; then
    echo "Done building, shutting down docker image in 10 secoonds..."
    sleep 10
    docker-compose down
fi
exit;
