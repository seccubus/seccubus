#!/bin/bash
# Copyright 2016 Frank Breedijk, Alexander Kaasjager
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

if [ "$1" == "" ]
then
	echo "USAGE: $0 command weekday"
	echo
	echo "Executes /command/ when day of the week is /weekday/"
	echo
	echo "Weekday is a number where 0 = Sunday, 1 = Monday, etc.."
	exit 1
fi

# BASE (NUMBER OF DAY) SHOULD NOT BE NULL
if [ "$BASE" == "" ]
then
        echo "Weekday should not be empty."
        exit 1
fi

DAYOFWEEK=$(date +%u)
if [ "$DAYOFWEEK" == "$BASE" ]
then
	eval "$COMMAND"
fi

