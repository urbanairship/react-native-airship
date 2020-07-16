#!/bin/bash -ex
SCRIPT_DIRECTORY=`dirname "$0"`
ROOT_PATH=`dirname "${0}"`/../

VERSION=$1

if [ -z "$1" ]
  then
    echo "No version supplied"
    exit
fi

# Update UARCTModuleVersion.m for current install
sed -i '' "s/\(airshipModuleVersionString *= *@\)\".*\"/\1\"$VERSION\"/g" ios/UARCTModule/UARCTModuleVersion.m
