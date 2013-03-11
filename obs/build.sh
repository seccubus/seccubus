#!/bin/bash
# Copyright 2013 Frank Breedijk
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

# Script to trigger build of packages on opensuse build server

VERSION=`(cd ..;perl -ISeccubusV2 -MSeccubusV2 -e 'print "$SeccubusV2::VERSION\n";'; )`
echo About to build version $VERSION on OpenSUSE build services
if [ ! -e "home:seccubus/Seccubus" ]
then
	osc co home:seccubus Seccubus
	cd home\:seccubus/Seccubus
else
	cd home\:seccubus/Seccubus
	osc up
fi

cp ../../../rpm/Seccubus2.spec .
cp ../../../deb/* .
osc rm Seccubus-*.tar.gz
if [ ! -e Seccubus-$VERSION.tar.gz ]
then
	cp ../../../Seccubus-$VERSION.tar.gz .
	osc add Seccubus-$VERSION.tar.gz
else
	cp ../../../Seccubus-$VERSION.tar.gz .
fi
sed -i "s:^Version\:.*:Version\:\t$VERSION:" Seccubus2.spec
sed -i "s:^Version\:.*:Version\: $VERSION:" seccubus.dsc
sed -i "s:Seccubus_.*\.tar\.gz.*:Seccubus_$VERSION.tar.gz:" seccubus.dsc

# OK lets commit
osc ci -m "Rebuild of $VERSION"
echo "Sleeping 1 minute to allow OpenSUSE build services to start"
sleep 60

BUILD=`osc results|grep -v succeeded|grep -v failed|wc -l`
while [ $BUILD -gt 0 ] 
do
	echo "Waiting for build to finish on $BUILD platform(s)"
	sleep 30
	BUILD=`osc results|grep building|wc -l`
done

FAIL=`osc results|grep failed|wc -l`
if [ $FAIL -gt 0 ]
then
	echo "OpenSUSE build service build failed on $FAIL platforms"
	osc results
	rm ../../*.log
	for PLATFORM in `osc results|grep failed|awk '{print $1}'|sort -u`
	do
		osc buildlog $PLATFORM i586 > ../../$PLATFORM-i586.log
		osc buildlog $PLATFORM x86_64 > ../../$PLATFORM-x86_64.log
	done
	exit 255
else
	for PLATFORM in `osc results|awk '{print $1}'|sort -u`
	do
		osc getbinaries $PLATFORM
	done
	mv binaries/*.rpm binaries/*.deb ../..
	cd ..
	osc copypac home:seccubus Seccubus home:seccubus Seccubus-$VERSION
	cd ..
	exit 0
fi
