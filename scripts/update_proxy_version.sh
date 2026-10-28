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

# Anything that is not a version is a mistake, and rejecting it here gives a
# clearer failure than a pin that reads back wrong at the end.
require_version() {
    local label="$1" value="$2"
    if ! printf '%s' "$value" | grep -Eq '^[0-9]+(\.[0-9]+)*([-+][0-9A-Za-z.-]+)?$'; then
        echo "error: $label version '$value' is not a version number" >&2
        exit 1
    fi
}

require_version "proxy" "$PROXY_VERSION"
if [ -n "$IOS_LIBRARY_VERSION" ]; then
    require_version "ios-library" "$IOS_LIBRARY_VERSION"
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

    # perl only warns on a file it cannot read and still exits 0, which would
    # leave the count empty. An empty count is not a number, so the comparison
    # below would error, and an errored test inside `if` reads as a pass.
    if [ ! -r "$ROOT_PATH/$file" ]; then
        echo "error: $file is missing or unreadable" >&2
        exit 1
    fi

    matches="$(perl -0777 -ne 'my $c = 0; $c++ while m{'"$regex"'}g; print $c' "$ROOT_PATH/$file")"
    if [ "${matches:-0}" -ne 1 ]; then
        echo "error: expected one $label pin in $file, found ${matches:-0}" >&2
        exit 1
    fi
}

# The version reaches perl through the environment rather than the program
# text: a `}` in the argument would otherwise close the replacement and the
# rest would run as Perl, and a bare $ or @ would interpolate silently.
apply_pin() {
    local file="$2" regex="$3" version="$4"
    PIN_VERSION="$version" \
        perl -0777 -i.bak -pe 's{'"$regex"'}{${1}$ENV{PIN_VERSION}}g' "$ROOT_PATH/$file"
}

# Reads each pin back out, so a bad rewrite shows up in the release log rather
# than in a published artifact.
verify_pin() {
    local label="$1" file="$2" regex="$3" version="$4" found
    # Read the pin back through the same pattern. Searching the whole file
    # would match any other field that happens to carry the same digits.
    found="$(perl -0777 -ne 'print $2 if m{'"$regex"'}' "$ROOT_PATH/$file")"
    if [ "$found" != "$version" ]; then
        echo "error: $label pin in $file reads '$found', expected '$version'" >&2
        exit 1
    fi
    echo "  ok: $file pins $label at $version"
}

for_each_pin check_pin
for_each_pin apply_pin

echo "Pins after update:"
for_each_pin verify_pin

# Only once every pin reads back correctly; a failed verify leaves the .bak
# files in place to restore from.
find "$ROOT_PATH" -name "*.bak" -delete
