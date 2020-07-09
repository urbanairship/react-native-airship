#!/bin/bash -ex
set -e
set -x

if [ -z "$1" ];
then
    echo "No version supplied"
    exit 1
fi

if [ ! -d "$2" ];
then
    echo "Missing docs $2"
    exit 1
fi

ROOT_PATH=`dirname "${0}"`/..
TAR_NAME="$1.tar.gz"

cd $2
tar -czf $TAR_NAME *
cd -

gsutil cp $2/$TAR_NAME gs://ua-web-ci-prod-docs-transfer/libraries/react-native/$TAR_NAME
