#!/bin/bash
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

echo "Build hook running"

IMAGE_NAME=${IMAGE_NAME:-$1}
IMAGE_NAME=${IMAGE_NAME:-'seccubus'}

if [[ "$IMAGE_NAME" == "seccubus" ]]; then
    BUILDSTACK="full"
elif [[ "$IMAGE_NAME" == "seccubus-front" ]]; then
    BUILDSTACK="front"
elif [[ "$IMAGE_NAME" == "seccubus-web" ]]; then
    BUILDSTACK="web"
elif [[ "$IMAGE_NAME" == "seccubus-api" ]]; then
    BUILDSTACK="api"
elif [[ "$IMAGE_NAME" == "seccubus-perl" ]]; then
    BUILDSTACK="perl"
elif [[ "$IMAGE_NAME" == "seccubus-cron" ]]; then
    BUILDSTACK="cron"
else
    echo "Unknown image name '$IMAGE_NAME', buidling a full stack"
    BUILDSTACK="full"
fi

docker build --build-arg BUILD_DATE=`date -u +"%Y-%m-%dT%H:%M:%SZ"` \
             --build-arg VCS_REF=`git rev-parse --short HEAD` \
             --build-arg BUILDSTACK=$BUILDSTACK \
             -f ./Dockerfile \
             -t $IMAGE_NAME ..
