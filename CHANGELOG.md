Version 6.1.0 - February 12, 2020
=================================
- Updated iOS SDK to 13.1.0
- Updated Android SDK to 12.2.0
- Added number attributes support for iOS and Android
- Added data collection controls for iOS and Android
- Added screen tracking for iOS and Android

Changes
-------
- Fixed npm configuration to include a required script.

Version 6.0.1 - January 3, 2020
=================================
Patch release to fix an issue causing a necessary script to be
excluded from the npm package. Applications using 6.0.0 should update.

Changes
-------
- Fixed npm configuration to include a required script.

Version 6.0.0 - December 31, 2019
=================================
Major release to update iOS to modularized SDK 13.0.4, update Android SDK to 12.1.0,
add cross-platform attribute support and modernize the Message Center Javascript
and Typescript interfaces.

Changes
-------
- Updated iOS SDK to 13.0.4
- Updated Android SDK to 12.1.0
- Added attributes support
- Updated Message Center interfaces to reflect the removal of overlay Message Center views

Version 5.0.1 - December 9, 2019
================================
Patch release to fix a bug affecting loss of tags on iOS during app
migration to plugin 5.0.0. This patch release fixes the bug
by combining previous tags with tags that have been set since
the update to 5.0.0. Applications using 5.0.0 should update.

Changes
-------
- Updated iOS SDK to 12.1.2

Version 5.0.0 - October 16, 2019
================================
- Updated iOS SDK to 12.0.0
- Updated iOS minimum deployment target to 11.0

Version 4.0.2 - September 3, 2019
=================================
- Updated Android SDK to 11.0.4.
- Updated iOS SDK to 11.1.2.
- Fixed display issues with UAMessageView.

Version 3.2.2 - September 3, 2019
=================================
- Updated Android SDK to 10.1.2.
- Fixed display issues with UAMessageView.

Version 4.0.1 - August 9, 2019
==============================
- Updated Android SDK to 11.0.3.

Version 3.2.1 - August 9, 2019
==============================
- Updated Android SDK to 10.1.1

Version 4.0.0 - August 1, 2019
==============================
- Updated Android SDK to 11.0.2.
- Requires ReactNative version to 0.6

Version 3.2.0 - August 1, 2019
==============================
- Fixed `isDeleted` erroneously being set to true for iOS inbox messages.
- Displaying an inbox message will now refresh the message listing if the inbox is out of date.
- Added UAMessageView to display an inbox message within the React Native view.
- Updated Android SDK to 10.1.0
- Updated iOS SDK to 11.1.1

Version 3.1.2 - July 24, 2019
=============================
- Fixed crash on iOS when calling `displayMessage` without the second optional parameter.
- Fixed not marking a message as read on iOS when calling `displayMessage` in an overlay.

Version 3.1.1 - July 15, 2019
=============================
- Fixed package including a .git directory in the release.

Version 3.1.0 - July 12, 2019
=============================
- Added the ability to do delayed channel registration.
- Added podspec for iOS cocoapod integration.

Version 3.0.0 - June 14, 2019
=============================
- Updated iOS SDK to 11.0.0.
- Updated Android SDK to 10.0.1.
- iOS integration now requires AirshipLocationKit for location services.
- Added ability to configure android notification options.

Version 2.2.1 - March 14, 2019
==============================
Fixed a security issue within Android Urban Airship SDK, that could allow trusted
URL redirects in certain edge cases. All applications that are using
urbanairship-react-native version 1.4.0 - 2.2.0 on Android should update as soon as possible.
For more details, please email security@urbanairship.com.

Version 2.2.0 - December 7, 2018
================================
- Updated Android SDK to 9.6.0.
- Android now requires compiling against API 28 (compileSdkVersion 28)
- Firebase core and messaging dependency versions can be overridden with `firebaseMessagingVersion` and `firebaseCoreVersion` gradle properties.
- Updated the sample to use latest React Native.

Version 2.1.3 - November 20, 2018
=================================
- Updated Android SDK to 9.5.6.

Version 2.1.2 - November 14, 2018
=================================
- Updated Android SDK to 9.5.5.
- Updated iOS SDK to 10.0.3.

Version 2.1.1 - October 1, 2018
=================================
- Reverted Android firebase-core dependency back to 16.0.1 to avoid bug in 16.0.3.

Version 2.1.0 - September 20, 2018
=================================
- Added support for enabling notifications with a resulting promise.
- Fixed iOS event addition bug.
- Updated Android SDK to 9.5.2.
- Updated iOS SDK to 10.0.0.

Version 2.0.3 - October 1, 2018
===============================
- Fixed iOS pending event (backported from 2.1.0).
- Updated Android SDK to 9.5.2.

Version 2.0.2 - September 5, 2018
=================================
- Fixed Android pending events.
- Updated Android SDK to 9.5.0.
- Updated recommmended iOS SDK to 9.4.0.
- Updated header search paths for ExpoKit.

Version 2.0.1 - July 30, 2018
=============================
- Fixed firebase-core dependency (now 16.0.1)

Version 2.0.0 - July 27, 2018
=============================
- Added support for authorized notification settings on iOS
- Android SDK now defaults to FCM, and depends on firebase-core
- Updated iOS SDK to 9.3.3
- Update Android SDK to 9.4.1

Version 1.6.2 - April 20, 2018
==============================
- Remove use of AsyncTaskCompat to be compatible with Android Support Library 27

Version 1.6.1 - April 3, 2018
==============================
- Fixed search paths for Carthage build
- Updated Urban Airship Android SDK to 9.0.6
- Updated Urban Airship iOS SDK to 9.0.5
- Removed android:theme from CustomMessageCenterActivity and CustomMessageActivity, so developers can customize the Message Center.

Version 1.6.0 - March 14, 2018
==============================
- Updated Urban Airship Android SDK to 9.0.3
- Added method to disable the iOS plugin integration at runtime

Version 1.5.0 - March 5, 2018
=================================
- Updated Urban Airship iOS SDK to 9.0.3
- Updated Urban Airship Android SDK to 9.0.2
- Added method to get the current registration token
- Added show inbox event when disabling the default message center
- Allow clearing named user with an empty string

Version 1.4.2 - February 13, 2018
=================================
- Updated Urban Airship Android SDK to 9.0.1
- Fixed compatibility issues with Android SDK 9.0

Version 1.4.1 - February 12, 2018
=================================
- Updated Urban Airship iOS SDK to 9.0.2
- Fixed compatibility issues with iOS SDK 9.0

Version 1.4.0 - February 7, 2018
=================================
- Updated Urban Airship iOS SDK to 9.0.1
- Updated Urban Airship Android SDK to 9.0.0

Version 1.3.2 - January 29, 2018
=================================
- Fixed a bug in Android that caused delayed event emission.

Version 1.3.1 - December 22, 2017
=================================
- Fixed bug in iOS that caused message center to launch with auto launch disabled.

Version 1.3.0 - November 15, 2017
=================================
- Added APIs to manage active notifications.

Version 1.2.3 - October 30, 2017
================================
- Changed Android Message Center title to be "Message Center" instead of the app name
- Updated Urban Airship Android SDK to 8.9.4

Version 1.2.2 - September 15, 2017
==================================
- Fixed Airship library linking
- Fixed iOS deep linking on cold start

Version 1.2.1 - September 11, 2017
==============================
- Added support for React Native >=.47
- Fixed quiet time

Version 1.2.0 - August 18, 2017
===============================
- Added support for dismissing messages from outside the Message Center
- Added support for Carthage
- Updated Urban Airship Android SDK to 8.8.2
- Fixed opt-in events to be more responsive to authorization status changes

Version 1.1.0 - June 21, 2017
=============================
- Added Message Center support
- Added iOS badge support
- Updated Urban Airship Android SDK to 8.6.0 (Android O support)
- Fixed optIn flag on the notificationOptInStatus event on Android

Version 1.0.3 - June 5, 2017
============================
- Fixed addCustomEvent on iOS

Version 1.0.2 - May 24, 2017
============================
- Fixed crash when calling removeListener

Version 1.0.1 - May 23, 2017
============================
- Updated Android and iOS Urban Airship SDK dependencies

Version 1.0.0 - May 16, 2017
============================
 - Initial release
