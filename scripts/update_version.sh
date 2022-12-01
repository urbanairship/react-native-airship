#!/bin/bash -ex

BASE_MODULE=urbanairship-react-native
SUBMODULES=(
  urbanairship-hms-react-native
  urbanairship-preference-center-react-native
)

print_usage() {
  echo "usage: $0 -p <package_version> [-i <ios_version>] [-a <android_version>]"
}

while getopts p:i:a: FLAG
do
  case "${FLAG}" in
    p) VERSION=${OPTARG} ;;
    i) IOS_VERSION=${OPTARG} ;;
    a) ANDROID_VERSION=${OPTARG} ;;
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

for MODULE in ${BASE_MODULE} ${SUBMODULES[@]}
do
  # Update the module version in package.json
  sed -i '' "s/\version\": \".*\",/\version\": \"$VERSION\",/g" ${MODULE}/package.json

  if [ -n "$ANDROID_VERSION" ]
  then
    # Update the android version in build.grade
    sed -i '' "s/\(airshipVersion *= *\)\".*\"/\1\"$ANDROID_VERSION\"/g" ${MODULE}/android/build.gradle
  fi

  if [ -n "$IOS_VERSION" ]
  then
    # Update the iOS version in the podspecs
    find ${MODULE} -name "urbanairship*.podspec" -exec sed -i '' "s/\(s.dependency \"Airship.*\", *\"\).*\"/\1$IOS_VERSION\"/g" {} +
  fi
done

# Update module versions in iOS native code
sed -i '' "s/\(airshipModuleVersionString *= *@\)\".*\"/\1\"$VERSION\"/g" urbanairship-react-native/ios/UARCTModule/UARCTModuleVersion.m

# Update iOS example dependencies
sed -i '' "s/\(pod *'AirshipExtensions\/NotificationService', *'~> *\).*'/\1$IOS_VERSION'/g" example/ios/Podfile
