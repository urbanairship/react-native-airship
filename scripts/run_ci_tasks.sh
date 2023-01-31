#!/bin/bash

#####################################################
# This script is used for Continuous Integration
#
# Run locally to verify before committing your code.
#
# Options:
#   -a to run Android CI tasks.
#   -i to run iOS CI tasks.
#####################################################

set -o pipefail
set -e
set -x

REPO_PATH=`dirname "${0}"`/../

# get platforms
ANDROID=false
IOS=false

# Parse arguments
OPTS=`getopt hai $*`
if [ $? != 0 ] ; then echo "Failed parsing options." >&2 ; exit 1 ; fi
eval set -- "$OPTS"

while true; do
  case "$1" in
    -h  ) echo -ne "-a to run Android CI tasks.\n-i to run iOS CI tasks.\n  Defaults to both. \n"; exit 0;;
    -a  ) ANDROID=true;;
    -i  ) IOS=true;;
    *   ) break ;;
  esac
  shift
done

cd $REPO_PATH

yarn

# Android
if $ANDROID ; then
    cd example/android
    

    # Build
    ./gradlew app:assembleDebug

    cd -
fi

# iOS
if $IOS; then
    cd example/ios

    # build iOS
    PROJECT_PLATFORM_PATH="$(pwd)"
    DERIVED_DATA=$(mktemp -d /tmp/ci-derived-data-XXXXX)
    TARGET_SDK='iphonesimulator'
    TEST_DESTINATION='platform=iOS Simulator,OS=latest,name=iPhone 11 Pro'

    # Install the pods
    pod install

    # Use Debug configurations and a simulator SDK so the build process doesn't attempt to sign the output
    xcrun xcodebuild -workspace "${PROJECT_PLATFORM_PATH}/AirshipExample.xcworkspace" -derivedDataPath "${DERIVED_DATA}" -scheme "AirshipSample" -configuration Debug -sdk $TARGET_SDK -destination "${TEST_DESTINATION}"

    cd -
fi
