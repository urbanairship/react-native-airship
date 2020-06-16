#!/bin/bash -ex
SCRIPT_DIRECTORY=`dirname "$0"`
ROOT_PATH=`dirname "${0}"`/../

VERSION=$1

if [ -z "$1" ]
  then
    echo "No version supplied"
    exit
fi

# Update AirshipLocationReactModuleVersion.m for current install
sed -i '' "s/\(moduleVersionString *= *@\)\".*\"/\1\"$VERSION\"/g" ios/AirshipLocationReactModuleVersion.m
