#!/bin/bash
#Put anything that needs to be executed pre-test by Jenkins here
ZEPATH=`pwd`

if [ ! -d "$ZEPATH/tmp" ]
then
	mkdir $ZEPATH/tmp
fi

if [ ! -d "$ZEPATH/tmp/install" ]
then
	mkdir $ZEPATH/tmp/install
else
	rm -rf $ZEPATH/tmp/install/Seccubus*
fi

if [ ! -d "$ZEPATH/tmp/install/seccubus" ]
then
	mkdir $ZEPATH/tmp/install/seccubus
else
	rm -rf $ZEPATH/tmp/install/seccubus/*
fi

(cd $ZEPATH/tmp/install;tar -xvzf ../../Seccubus*.tar.gz)

(cd $ZEPATH/tmp/install/Seccubus-*;./install.pl --basedir $ZEPATH/tmp/install/seccubus --create_dirs -vvv)
cp $ZEPATH/tmp/install/seccubus/etc/config.xml.mysql.example $ZEPATH/tmp/install/seccubus/etc/config.xml
cp -r $ZEPATH/t/Algorithm $ZEPATH/tmp/install/seccubus/SeccubusV2/
