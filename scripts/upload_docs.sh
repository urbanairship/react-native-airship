#!/bin/bash -ex
set -e
set -x

if [ -z "$1" ];
then
    echo "No version supplied"
    exit 1
fi

ROOT_PATH=$PWD/`dirname "${0}"`/..
VERSION=$1
TAR_NAME="$ROOT_PATH/build/Documentation.tar.gz"
DEST_PATH="$ROOT_PATH/build/Documentation"

mkdir -p $DEST_PATH
cd $DEST_PATH

cp -p $ROOT_PATH/documentation/index-for-docs.html index.html

cp -rp $ROOT_PATH/urbanairship-accengage-react-native/docs urbanairship-accengage-react-native
cp -rp $ROOT_PATH/urbanairship-hms-react-native/docs urbanairship-hms-react-native
cp -rp $ROOT_PATH/urbanairship-preference-center-react-native/docs urbanairship-location-react-native
cp -rp $ROOT_PATH/urbanairship-react-native/docs urbanairship-react-native

tar -czf $TAR_NAME *
cd -

gsutil cp $TAR_NAME gs://ua-web-ci-prod-docs-transfer/libraries/react-native/$VERSION.tar.gz
