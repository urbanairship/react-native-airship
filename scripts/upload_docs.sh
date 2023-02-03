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
TAR_NAME="$ROOT_PATH/docs/Documentation.tar.gz"

cd "$ROOT_PATH/docs/"
tar -czf $TAR_NAME *
cd -

gsutil cp $TAR_NAME gs://ua-web-ci-prod-docs-transfer/libraries/react-native/$VERSION.tar.gz
