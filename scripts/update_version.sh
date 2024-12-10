REPO_PATH=$(dirname "${0}")/..

print_usage() {
  echo "usage: $0 <package_version>"
}

if [ $# -lt 1 ]; then
  echo "$0: A package version is required"
  print_usage
  exit 1
fi

VERSION=$1

echo "Updating package version to $VERSION in package.json..."
sed -i '' "s/\"version\": \".*\",/\"version\": \"$VERSION\",/g" "$REPO_PATH/package.json"

echo "Updating version to $VERSION in ios/AirshipReactNative.swift..."
sed -i '' "s/\(version:\ String *= *\)\".*\"/\1\"$VERSION\"/g" "$REPO_PATH/ios/AirshipReactNative.swift"

echo "Version update complete."
