#!/bin/bash
# ------------------------------------------------------------------------------
# $Id: EveryXXXday.sh,v 1.2 2008/04/28 10:49:13 frank_breedijk Exp $
# ------------------------------------------------------------------------------
# Copyright (C) 2008  Schuberg Philis, Frank Breedijk - Under GPLv3
# ------------------------------------------------------------------------------
COMMAND=$1
BASE=$2
PLUS=$3

if [ "$1" == "" ] 
then
	echo "USAGE: $0 command weekday"
	echo
	echo "Executes /command/ when day of the week is /weekday/"
	echo
	echo "Weekday is a number where 0 = sunday, 1 = moday, etc.."
	exit
fi

DAYOFWEEK=`date +%u`
if [ "$DAYOFWEEK" == "$2" ]
then
	eval "$1"
fi

