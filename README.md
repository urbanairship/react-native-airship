# Airship React Native

[![npm version](https://badge.fury.io/js/%40ua%2Freact-native-airship.svg)](https://badge.fury.io/js/%40ua%2Freact-native-airship)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

The official Airship React Native module for iOS and Android.

## Features

- **Push Notifications** - Rich, interactive push notifications with deep linking
- **Live Activities & Live Updates** - Real-time content updates on iOS Lock Screen and Android Live Content
- **In-App Experiences** - Contextual messaging, automation, and Scenes
- **Embedded Content** - Render Airship Scenes directly in your React Native app
- **Custom Views** - Extend Scenes with native content
- **Message Center** - Persistent inbox for rich messages with HTML, video, and interactive content
- **Preference Center** - User preference management
- **Feature Flags** - Dynamic feature toggles and experimentation
- **Analytics** - Comprehensive user behavior tracking
- **Contacts** - User identification and contact management
- **Tags, Attributes & Subscription Lists** - User segmentation, personalization, and subscription management
- **Privacy Controls** - Granular data collection and feature management
- **Extensible & Hybrid Compatible** - Works seamlessly in hybrid apps and supports native extensions

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

## Versions and Support

For the current Support Status of each module major, EOL dates, and the full lifecycle policy, see the [Airship SDK Support Policy](https://www.airship.com/docs/reference/sdk-support-policy/).

## Resources

- **[Documentation](https://docs.airship.com/developer/sdk-integration/react-native)** - Complete SDK integration guides and feature documentation
- **[API Reference](https://docs.airship.com/reference/libraries/react-native/latest/)** - Detailed TypeScript API documentation
- **[SDK Support Policy](https://www.airship.com/docs/reference/sdk-support-policy/)** - Version lifecycle, support windows, and EOL dates across all Airship SDKs
- **[GitHub Issues](https://github.com/urbanairship/react-native-airship/issues)** - Report bugs and request features
- **[Changelog](CHANGELOG.md)** - Release notes and version history
- **[Migration Guide](MIGRATION.md)** - Upgrade guides between major versions
