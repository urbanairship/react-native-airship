#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIRECTORY="$(cd "$(dirname "$0")" && pwd)"
ROOT_PATH="$SCRIPT_DIRECTORY/.."

PROXY_VERSION="${1:-}"
IOS_LIBRARY_VERSION="${2:-}"

if [ -z "$PROXY_VERSION" ]; then
    echo "usage: $(basename "$0") <proxy-version> [ios-library-version]" >&2
    exit 1
fi

PROXY_URL='https://github\.com/urbanairship/airship-mobile-framework-proxy\.git'
IOS_LIBRARY_URL='https://github\.com/urbanairship/ios-library\.git'

# Calls "$1" with (label, file, regex, version) once per pin this run touches.
#
# Each regex takes two capture groups: everything up to the version, and the
# version itself. A closing quote is left outside the match. Braces delimit the
# match because the patterns contain URLs.
for_each_pin() {
    local fn="$1"

    "$fn" "proxy" "android/gradle.properties" \
        '(Airship_airshipProxyVersion=)([^[:space:]]*)' "$PROXY_VERSION"

    "$fn" "proxy" "react-native-airship.podspec" \
        '(url:\s*"'"$PROXY_URL"'",\s*requirement:\s*\{\s*kind:\s*"exactVersion",\s*version:\s*")([^"]*)' \
        "$PROXY_VERSION"

    "$fn" "proxy" "Package.swift" \
        '(\.package\(url:\s*"'"$PROXY_URL"'",\s*exact:\s*")([^"]*)' "$PROXY_VERSION"

    if [ -n "$IOS_LIBRARY_VERSION" ]; then
        "$fn" "ios-library" "react-native-airship.podspec" \
            '(url:\s*"'"$IOS_LIBRARY_URL"'",\s*requirement:\s*\{\s*kind:\s*"exactVersion",\s*version:\s*")([^"]*)' \
            "$IOS_LIBRARY_VERSION"

        "$fn" "ios-library" "Package.swift" \
            '(\.package\(url:\s*"'"$IOS_LIBRARY_URL"'",\s*exact:\s*")([^"]*)' "$IOS_LIBRARY_VERSION"
    fi
}

# A substitution that matches nothing still exits 0, so every pin is located
# before any file is written. Checking up front keeps a pin that has moved from
# leaving the tree half bumped, with some platforms on the new version.
check_pin() {
    local label="$1" file="$2" regex="$3" matches
    matches="$(perl -0777 -ne 'my $c = 0; $c++ while m{'"$regex"'}g; print $c' "$ROOT_PATH/$file")"
    if [ "$matches" -ne 1 ]; then
        echo "error: expected one $label pin in $file, found $matches" >&2
        exit 1
    fi
}

apply_pin() {
    local file="$2" regex="$3" version="$4"
    perl -0777 -i.bak -pe 's{'"$regex"'}{${1}'"$version"'}g' "$ROOT_PATH/$file"
}

# Reads each pin back out, so a bad rewrite shows up in the release log rather
# than in a published artifact.
verify_pin() {
    local label="$1" file="$2" version="$4"
    if ! grep -q -- "$version" "$ROOT_PATH/$file"; then
        echo "error: $label is not $version in $file after rewriting" >&2
        exit 1
    fi
    echo "  ok: $file pins $label at $version"
}

for_each_pin check_pin
for_each_pin apply_pin

find "$ROOT_PATH" -name "*.bak" -delete

echo "Pins after update:"
for_each_pin verify_pin
