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

