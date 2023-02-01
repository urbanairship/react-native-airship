#!/bin/bash -ex

REPO_PATH=`dirname "${0}"`/..

print_usage() {
  echo "usage: $0 -p <package_version>"
}

while getopts p:i:a: FLAG
do
  case "${FLAG}" in
    p) VERSION=${OPTARG} ;;
    *) print_usage
       exit 1 ;;
    esac
done

if [ -z $VERSION ]
then
  echo "$0: A package version is required"
  print_usage
  exit 1
fi


sed -i '' "s/\version\": \".*\",/\version\": \"$VERSION\",/g" "$REPO_PATH/package.json"
sed -i '' "s/\(version:\ String *= *\)\".*\"/\1\"$VERSION\"/g" "$REPO_PATH/ios/AirshipReactNative.swift"

# Update iOS example dependencies
# sed -i '' "s/\(pod *'AirshipExtensions\/NotificationService', *'~> *\).*'/\1$IOS_VERSION'/g" example/ios/Podfile
