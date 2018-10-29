#!/bin/bash
# Copyright 2017-2018 Frank Breedijk
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
set -e
UPSTREAM_VERSION=$1
COMMITS=$2
if [ -z $VERSION ]; then
    echo "Trying to determine version and commit count from git"
    FULLVERSION=$(git describe)
    UPSTREAM_VERSION=$(echo $FULLVERSION|sed 's/\-.*//')
    COMMITS=$(echo $FULLVERSION|sed 's/^[0-9\.]*\-//'|sed 's/\-.*//')
    if [[ "$UPSTREAM_VERSION" == "$COMMITS" ]]; then
        COMMITS=0
    fi
fi

[ -z $UPSTREAM_VERSION ] && echo "We need a version number as first argument" && exit
[ -z $COMMITS ] && echo "We a commit count as second argument" && exit

VERSION="$UPSTREAM_VERSION"
BRANCH=$(git branch | grep '*'|awk '{print $2}')

[ ! -d build ] && mkdir build
[ -d $DIR ] && rm -rf $DIR

NOSIGN="--no-sign"
if [[ "$BRANCH" == "master" ]] || [[ "$BRANCH" == "rpm-build" ]] ; then
    if [[ ! -z $SECCUBUS_GPG_KEY ]] ; then #&& [[ $(grep -i centos /etc/redhat-release | wc -l) -lt 1 ]]; then
        # TODO fix sgining on CentOS
        echo Setting up gpg
        set +x
        echo $SECCUBUS_GPG_KEY | sed 's/\\n/\n/g' > /tmp/gpg.key
        gpg --import --batch --yes /tmp/gpg.key
        rm /tmp/gpg.key
        echo "%_gpg_name Frank Breedijk" > ~/.rpmmacros
        SIGN=" --sign "
        NOSIGN=" "
        if [[ $(grep -i centos /etc/redhat-release | wc -l) -eq 1 ]]; then
            echo
            NOPWD="rpm/nopwd.exp"
        fi
    fi
fi

set -x
echo "Creating directories"
mkdir -p /root/rpmbuild/SOURCES

echo "Copying files"
(cd /tmp; rm -f seccubus-$VERSION ; ln -s /root/project /tmp/seccubus-$VERSION;tar -czf /root/rpmbuild/SOURCES/seccubus-$VERSION.tar.gz --exclude "seccubus-$VERSION/tmp" --exclude "seccubus-$VERSION/build" seccubus-$VERSION/*)

echo "Building"
cat /root/project/rpm/seccubus.spec | sed "s/master$/$VERSION/" | sed "s/^Release\\:    0$/Release:    $COMMITS/" >/root/rpmbuild/SOURCES/seccubus.spec
$NOPWD /usr/bin/rpmbuild $SIGN -ba /root/rpmbuild/SOURCES/seccubus.spec

if [[ $(grep -i centos /etc/redhat-release|wc -l) -eq 1 ]]; then
    yum install -y epel-release
    yum install -y perl-libwww-perl gcc "perl(Module::Build)" "perl(JSON::PP)" "perl(IO::Socket::IP)" "perl(Pod::Parser)" \
        "perl(Canary::Stability)" "perl(common::sense)"
    curl -Ls http://cpanmin.us | perl - App::cpanminus

    [[ ! -e /tmp/cpan2rpm ]] && (cd /tmp;git clone https://github.com/ekkis/cpan2rpm.git --depth=1)
    if [[ $(/tmp/cpan2rpm/cpan2rpm -V) == '2.031' ]]; then
        (cd /tmp/;rm -rf cpan2rpm;git clone https://github.com/seccubus/cpan2rpm.git;cd cpan2rpm;git checkout fix-metacpan)
    fi

    cpanm IO::Socket::IP
    VER=$(cpanm IO::Socket::IP | sed 's/.*(//' | sed 's/).*//')
    set +x
    $NOPWD /tmp/cpan2rpm/cpan2rpm IO::Socket::IP --version $VER $NOSIGN
    cpanm List::Util
    rm -f /usr/local/lib64/perl5/Scalar/Util.pm
    $NOPWD /tmp/cpan2rpm/cpan2rpm List::Util $NOSIGN
    $NOPWD /tmp/cpan2rpm/cpan2rpm Sub::Util $NOSIGN
    $NOPWD /tmp/cpan2rpm/cpan2rpm Mojolicious $NOSIGN
    if [[ -z "$NOPWD" ]]; then
        echo y | /tmp/cpan2rpm/cpan2rpm EV $NOSIGN
        (echo y;echo y)| /tmp/cpan2rpm/cpan2rpm IO::Socket::SSL $NOSIGN
    else
        $NOPWD echo y \| /tmp/cpan2rpm/cpan2rpm EV $NOSIGN
        $NOPWD \(echo y\;echo y\) \| /tmp/cpan2rpm/cpan2rpm IO::Socket::SSL $NOSIGN
    fi
    set -x
fi

find /root/rpmbuild -name "*.rpm" -exec cp {} /root/project/build \;

if [[ $(grep -i centos /etc/redhat-release|wc -l) -eq 1 ]]; then
    for OLD in $(ls build/perl-*.noarch.rpm build/perl-*.x86_64.rpm); do
        NEW=${OLD//-1.x86_64./-1.el7.x86_64.}
        NEW=${NEW//-1.noarch./-1.el7.noarch.}
        mv $OLD $NEW
    done
fi

exit
