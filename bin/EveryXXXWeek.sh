#!/bin/bash
# ------------------------------------------------------------------------------
# $Id: EveryXXXWeek.sh,v 1.2 2008/04/28 10:49:13 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------

COMMAND=$1
BASE=$2
PLUS=$3

if [ "$1" == "" ] 
then
	echo "USAGE: $0 command base [addition]"
	echo
	echo "If current ISO weeknumber devided by base is either addition (if specified)"
	echo "or 0 (if addition is not specified) then execute command."
	echo 
	exit
fi
if [ "$3" == "" ]
then
	PLUS=0
fi

WEEKNO=`date +%V`
MOD=`perl -e "print $WEEKNO % $BASE"`
if [ "$MOD" == "$PLUS" ]
then
	eval "$1"
fi

