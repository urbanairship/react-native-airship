#!/usr/bin/env bash
set -euxo pipefail

SCRIPT_DIRECTORY="$(cd "$(dirname "$0")" && pwd)"
ROOT_PATH="$SCRIPT_DIRECTORY/.."

PROXY_VERSION="$1"
if [ -z "$PROXY_VERSION" ]; then
    echo "No proxy version supplied"
    exit 1
fi

# Update Android gradle.properties
sed -i.bak -E "s/(Airship_airshipProxyVersion=)([^$]*)/\1$PROXY_VERSION/" "$ROOT_PATH/android/gradle.properties"

# Update iOS podspec
sed -i.bak -E "s/(s\.dependency *\"AirshipFrameworkProxy\", *\")([^\"]*)(\")/\1$PROXY_VERSION\3/" "$ROOT_PATH/react-native-airship.podspec"

find "$ROOT_PATH" -name "*.bak" -delete
