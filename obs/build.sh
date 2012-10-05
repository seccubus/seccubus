#!/bin/bash

# Script to trigger build of packages on opensuse build server

VERSION=`perl -I.. -MSeccubusV2 -e 'print "$SeccubusV2::VERSION\n";'`
echo $VERSION
if [ ! -e "home:seccubus/Seccubus" ]
then
	osc co home:seccubus Seccubus
	cd home\:seccubus/Seccubus
else
	cd home\:seccubus/Seccubus
	osc up
fi

cp ../../../rpm/Seccubus2.spec .
osc rm Seccubus-*.tar.gz
if [ ! -e Seccubus-$VERSION.tar.gz ]
then
	cp ../../../Seccubus-$VERSION.tar.gz .
	osc add Seccubus-$VERSION.tar.gz
else
	cp ../../../Seccubus-$VERSION.tar.gz .
fi
sed -i "s:^Version\:.*:Version\:\t$VERSION:" Seccubus2.spec

# OK lets commit
osc ci -m "Rebuild of $VERSION"
echo "Sleeping 1 minute to allow OpenSUSE build services to start"
sleep 60

BUILD=`osc results|grep building|wc -l`
while [ $BUILD -gt 0 ] 
do
	echo "Still building $BUILD platforms"
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
	exit 0
fi
