# Airship React Native

[![npm version](https://badge.fury.io/js/%40ua%2Freact-native-airship.svg)](https://badge.fury.io/js/%40ua%2Freact-native-airship)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

The official Airship React Native module for iOS and Android.

## Platform Support

| Feature                               | iOS | Android |
| :------------------------------------ | :-: | :-----: |
| Push Notifications                    | ✅  | ✅      |
| Live Activities                       | ✅  | ❌      |
| Live Updates                          | ❌  | ✅      |
| In-App Experiences                    | ✅  | ✅      |
| Custom Views                          | ✅  | ✅      |
| Embedded Content                      | ✅  | ✅      |
| Message Center                        | ✅  | ✅      |
| Preference Center                     | ✅  | ✅      |
| Feature Flags                         | ✅  | ✅      |
| Analytics                             | ✅  | ✅      |
| Contacts                              | ✅  | ✅      |
| Tags, Attributes & Subscription Lists | ✅  | ✅      |
| Privacy Controls                      | ✅  | ✅      |

## Quick Start

### Standard React Native

Install the package:
```bash
npm install @ua/react-native-airship --save
```
or
```bash
yarn add @ua/react-native-airship
```

### Expo

Apps using Expo can use the `airship-expo-plugin` to configure the project. You will need to use `expo prebuild` (custom dev client) or `eas build` since this package contains native code.

First, install the plugin and the main package:
```bash
expo install airship-expo-plugin
yarn add @ua/react-native-airship
```

Then, add the plugin to your `app.json`:
```json
"plugins": [
  [
    "airship-expo-plugin",
    {
      "android": {
        "icon": "./path/to/ic_notification.png"
      },
      "ios": {
        "mode": "development"
      }
    }
  ]
]
```

**Known Issues**
- **Expo SDK 50+ (Dev Builds):** Tapping a foreground notification may cause the app to reload when running in a dev client. This can be resolved by setting the `launchMode` to `launcher` in your `app.json` for `expo-dev-client`. See [issue #550](https://github.com/urbanairship/react-native-airship/issues/550) for more details.
  ```json
  "plugins": [
    [
      "expo-dev-client",
      {
        "ios": { "launchMode": "launcher" },
        "android": { "launchMode": "launcher" }
      }
    ]
  ]
  ```

### Initialization

Initialize Airship in your `App.tsx`:
```typescript
import { useEffect } from 'react';
import Airship from '@ua/react-native-airship';

export default function App() {
  useEffect(() => {
    const takeOff = async () => {
      try {
        await Airship.takeOff({
          default: {
            appKey: "YOUR_APP_KEY",
            appSecret: "YOUR_APP_SECRET"
          },
        });
        
        await Airship.push.enableUserNotifications();
      } catch (error) {
        console.error("Failed to take off:", error);
      }
    };

    takeOff();
  }, []);

  // ... your app code
}
```

For a more detailed setup guide, please see the full [Getting Started Documentation](https://docs.airship.com/developer/sdk-integration/react-native/installation/getting-started).

## Supported Versions

| Airship RN Version | Airship SDK Version | Supported RN Versions | Support Status                        |
| :----------------- | :------------------ | :-------------------- | :------------------------------------ |
| **26.x**           | 20.x                | 0.82.x – 0.83.x       | **Active**                            |
| **25.x**           | 19.x                | 0.81.x – 0.82.x       | **Maintenance** (Until Jun 8, 2026)   |
| **24.x**           | 19.x                | 0.79.x – 0.80.x       | **Maintenance** (Until Feb 21, 2026)  |
| **23.x**           | 19.x                | 0.78.x                | **Unsupported**                       |
| **21.x**           | 19.x                | 0.70.x – 0.77.x       | **Unsupported**                       |

*Table last updated: December 8, 2025*

### Support Policy Definitions

Airship adheres to **Semantic Versioning** and the [React Native Support Policy](https://github.com/reactwg/react-native-releases/blob/main/docs/support.md).

- **Version Strategy:** Breaking changes in React Native, Airship’s native SDKs, or the module’s public API may require a new major version.
- **Compatibility:** Only **Active** versions are evaluated for compatibility when new React Native versions are released. Compatibility with new React Native releases may require a new major Airship version.
- **Backports:** React Native compatibility updates are **not backported** to older Airship versions.

#### Active

Active versions are major releases of the Airship React Native Module that are currently in active development. These versions receive new features, bug fixes, and support for the React Native versions listed in the table above.

More than one major version may be Active at the same time when each targets a different React Native version range.

A new major version of the Airship React Native Module will be released if:
1. **React Native Upgrades:** A new React Native release requires breaking changes to the module.
2. **Airship SDK Upgrades:** The underlying native Airship SDKs (iOS/Android) introduce breaking changes or major architecture updates.
3. **Module API Changes:** Breaking changes are made to the Airship React Native Module’s public API or packaging.

#### Maintenance (End of Cycle)

A major version enters a **6-month Maintenance window** when either:
1. It is superseded by a newer major release **targeting the same React Native versions**, or
2. The React Native versions it supports reach `End of Cycle` or `Unsupported` in the official React Native policy.

- **Duration:** The maintenance window lasts for 6 months from the date the trigger occurs.
- **Includes:** Updates include critical bug fixes and security patches, **provided they can be resolved without breaking changes**.
- **Excludes:** Updates exclude new features or support for *future* React Native versions (e.g., RN 0.83+ will not be added to Airship 25.x).
- **Goal:** The goal is to provide a stable transition period for customers to migrate to an Active version.

#### Unsupported (End of Life)

Unsupported versions are releases that have passed their Maintenance window. No updates or support are provided for these versions.

## Resources

- **[Documentation](https://docs.airship.com/developer/sdk-integration/react-native)** - Complete SDK integration guides and feature documentation
- **[API Reference](https://docs.airship.com/reference/libraries/react-native/latest/)** - Detailed TypeScript API documentation
- **[GitHub Issues](https://github.com/urbanairship/react-native-airship/issues)** - Report bugs and request features
- **[Changelog](CHANGELOG.md)** - Release notes and version history
- **[Migration Guide](MIGRATION.md)** - Upgrade guides between major versions