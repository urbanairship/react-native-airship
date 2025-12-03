# Airship React Native

The official Airship React Native module for iOS and Android.

## Supported Versions

| Airship RN Version | Supported RN Versions | Support Status                        |
| :----------------- | :-------------------- | :------------------------------------ |
| **25.x**           | 0.81.x – 0.82.x       | **Active**                            |
| **24.x**           | 0.79.x – 0.80.x       | **Maintenance** (Until Feb 21, 2026)  |
| **23.x**           | 0.78.x                | **Unsupported**                       |
| **21.x**           | 0.70.x – 0.77.x       | **Unsupported**                       |

*Table last updated: December 2, 2025*

## Support Policy Definitions

Airship adheres to **Semantic Versioning** and the [React Native Support Policy](https://github.com/reactwg/react-native-releases/blob/main/docs/support.md).

- **Version Strategy:** Breaking changes in React Native, Airship’s native SDKs, or the module’s public API may require a new major version.
- **Compatibility:** Only **Active** versions are evaluated for compatibility when new React Native versions are released. Compatibility with new React Native releases may require a new major Airship version.
- **Backports:** React Native compatibility updates are **not backported** to older Airship versions.

### Active

Active versions are major releases of the Airship React Native Module that are currently in active development. These versions receive new features, bug fixes, and support for the React Native versions listed in the table above.

More than one major version may be Active at the same time when each targets a different React Native version range.

A new major version of the Airship React Native Module will be released if:
1. **React Native Upgrades:** A new React Native release requires breaking changes to the module.
2. **Airship SDK Upgrades:** The underlying native Airship SDKs (iOS/Android) introduce breaking changes or major architecture updates.
3. **Module API Changes:** Breaking changes are made to the Airship React Native Module’s public API or packaging.

### Maintenance (End of Cycle)

A major version enters a **6-month Maintenance window** when either:
1. It is superseded by a newer major release **targeting the same React Native versions**, or
2. The React Native versions it supports reach `End of Cycle` or `Unsupported` in the official React Native policy.

- **Duration:** The maintenance window lasts for 6 months from the date the trigger occurs.
- **Includes:** Updates include critical bug fixes and security patches, **provided they can be resolved without breaking changes**.
- **Excludes:** Updates exclude new features or support for *future* React Native versions (e.g., RN 0.83+ will not be added to Airship 25.x).
- **Goal:** The goal is to provide a stable transition period for customers to migrate to an Active version.

### Unsupported (End of Life)

Unsupported versions are releases that have passed their Maintenance window. No updates or support are provided for these versions.

## Resources

- [Getting started guide](http://docs.airship.com/platform/react-native/)
- [API docs](http://docs.airship.com/reference/libraries/react-native/latest/index.html)
- [Report Issues](https://github.com/urbanairship/react-native-airship/issues)