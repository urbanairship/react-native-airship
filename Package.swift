// swift-tools-version: 6.0

// Copyright Airship and Contributors

// Swift Package Manager manifest for React Native's SwiftPM integration
// (React Native 0.87+, `npx react-native spm`). CocoaPods remains the default
// integration and continues to use react-native-airship.podspec.
//
// React Native's autolinker references this package through a
// `build/generated/autolinking/libs/ReactNativeAirship` symlink inside the
// app's `ios/` directory, so the relative package paths below are resolved
// from that location rather than from node_modules.

import PackageDescription

let reactHeaders: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
    .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
]

let package = Package(
    name: "ReactNativeAirship",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "ReactNativeAirship",
            targets: ["ReactNativeAirshipBridge", "react_native_airship", "ReactNativeAirshipObjC"]
        ),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        .package(url: "https://github.com/urbanairship/airship-mobile-framework-proxy.git", exact: "15.16.0"),
    ],
    targets: [
        // SwiftPM cannot compile Swift and Objective-C++ in one target, and
        // Xcode does not expose a Swift target's generated header to sibling
        // Objective-C targets. The Objective-C++ React Native glue therefore
        // talks to the Swift implementation through the protocols in the
        // bridge target, which both sides depend on.
        .target(
            name: "ReactNativeAirshipBridge",
            path: "ios/Bridge",
            publicHeadersPath: "."
        ),
        .target(
            name: "react_native_airship",
            dependencies: reactHeaders + [
                "ReactNativeAirshipBridge",
                .product(name: "AirshipFrameworkProxy", package: "airship-mobile-framework-proxy"),
            ],
            path: "ios",
            sources: [
                "AirshipEmbeddedViewWrapper.swift",
                "AirshipPluginLoader.swift",
                "AirshipReactNative.swift",
                "MessageWebViewWrapper.swift",
                "ProxyDataMigrator.swift",
            ]
        ),
        .target(
            name: "ReactNativeAirshipObjC",
            dependencies: reactHeaders + ["ReactNativeAirshipBridge"],
            path: "ios",
            sources: [
                "RNAirship.mm",
                "RNAirshipBootloader.m",
                "RNAirshipEmbeddedView.mm",
                "RNAirshipEmbeddedViewViewManager.mm",
                "RNAirshipMessageView.mm",
                "RNAirshipMessageViewManager.mm",
            ],
            publicHeadersPath: ".",
            cSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
            ],
            cxxSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                // Match the prebuilt React.framework's config-gated C++ ABI.
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ],
            linkerSettings: [
                .linkedFramework("Foundation"),
                .linkedFramework("UIKit"),
                .linkedFramework("WebKit"),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
