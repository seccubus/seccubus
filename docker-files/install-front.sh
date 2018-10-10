#!/bin/sh
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
set -x
set -e

# Install prerequisites
apk update
# Basics
APKS="tzdata logrotate bash"
# Web server
APKS="$APKS openssl nginx"

# Install
apk add $APKS

# Extract tarbal
cd /build/seccubus
tar -xvzf build/Seccubus*.tar.gz
cd Seccubus-*

# create files
mkdir -p /opt/seccubus/data
chmod -R 755 /opt/seccubus

mv public /opt/seccubus

# Cleanup build stuff
set +e
rm -rf /build


