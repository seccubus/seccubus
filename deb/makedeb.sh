#!/bin/bash
# ------------------------------------------------------------------------------
# Copyright 2017 Arkanoi, Frank Breedijk, Petr
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
[ -z $1 ] && echo "We need a version number as first argument" && exit
[ -z $2 ] && echo "We a commit count as second argument" && exit

VERSION="$1.$2"
DIR="/tmp/seccubus-$1"

[ ! -d build ] && mkdir build
[ -d $DIR ] && rm -rf $DIR

echo "Copying files"
mkdir $DIR
cd $DIR
(cd /root/project;tar -cf - --exclude \"tmp/*\" *)|tar -xf -
echo "Building"
[ -d debian ] && rm -rf debian
mkdir debian
for f in $(ls deb); do
    NEWNAME=$(echo $f|sed 's/^debian\.//')
    case $NEWNAME in
        changelog)
            cat deb/$f|sed s/\(0\.0\.0\-0\)/\($VERSION\)/ > debian/$NEWNAME
            ;;
        seccubus.dsc)
            cat deb/$f|sed "s/Version\: .*/Version\: $VERSION/" > debian/$NEWNAME
            ;;
        *)
            ln -s $DIR/deb/$f debian/$NEWNAME
            ;;
    esac
done
dpkg-buildpackage
dpkg-deb --build debian/seccubus /root/project/build
