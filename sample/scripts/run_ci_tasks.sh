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

# install tools not present on raw machine
if [ "$BITRISE_IO" = "true" ]; then
    npm install -g react-native-cli
fi

# verify react-native CLI is installed
react-native -v

# set up react-native project
if [[ "$BITRISE_SOURCE_DIR" != "" ]]; then
    REPO_PATH="${BITRISE_SOURCE_DIR}"
else
    REPO_PATH=`dirname "${0}"`/../../
fi

cd $REPO_PATH
pwd
npm link
cd sample/AirshipSample
npm install
npm link urbanairship-react-native

# Android
if $ANDROID ; then
    cd android

    # build Android
    PROJECT_PLATFORM_PATH="$(pwd)"

    # Make sure google-services.json exists
    GOOGLE_SERVICES_FILE_PATH="${PROJECT_PLATFORM_PATH}/app/google-services.json"
    if [[ ! -f ${GOOGLE_SERVICES_FILE_PATH} ]]; then
      if [[ "$GOOGLE_SERVICES_JSON" == "" ]]; then
        echo "ERROR: You must provide ${GOOGLE_SERVICES_FILE_PATH}."
        exit 1
      else
        echo $GOOGLE_SERVICES_JSON > ${GOOGLE_SERVICES_FILE_PATH}
      fi
    fi

    # Make sure airshipconfig.properties exists
    if [[ ! -f ${PROJECT_PLATFORM_PATH}/app/src/main/assets/airshipconfig.properties ]]; then
      cp -np ${PROJECT_PLATFORM_PATH}/app/src/main/assets/airshipconfig.properties.sample ${PROJECT_PLATFORM_PATH}/app/src/main/assets/airshipconfig.properties || true
    fi

    # Build sample
    ./gradlew app:assembleDebug

    cd ..
fi

# iOS
if $IOS; then
    cd iOS

    # build iOS
    PROJECT_PLATFORM_PATH="$(pwd)"
    DERIVED_DATA=$(mktemp -d /tmp/ci-derived-data-XXXXX)
    TARGET_SDK='iphonesimulator'
    TEST_DESTINATION='platform=iOS Simulator,OS=latest,name=iPhone SE'

    # install the SDK
    if [ "$BITRISE_IO" = "true" ]; then
        pod repo update
    fi
    pod install

    # Make sure AirshipConfig.plist exists
    cp -np ${PROJECT_PLATFORM_PATH}/AirshipConfig.plist.sample ${PROJECT_PLATFORM_PATH}/AirshipConfig.plist || true

    # Use Debug configurations and a simulator SDK so the build process doesn't attempt to sign the output
    xcrun xcodebuild -workspace "${PROJECT_PLATFORM_PATH}/AirshipSample.xcworkspace" -derivedDataPath "${DERIVED_DATA}" -scheme "AirshipSample Cocoapods" -configuration Debug -sdk $TARGET_SDK -destination "${TEST_DESTINATION}"

    cd ..
fi
