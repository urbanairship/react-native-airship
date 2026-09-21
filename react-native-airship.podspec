require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-airship"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "16.0" }
  s.source       = { :git => "https://github.com/urbanairship/react-native-module.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.exclude_files = "ios/generated/**/*"
  s.private_header_files = "ios/*.h"
  s.swift_version = "6.0"

  install_modules_dependencies(s)

  # AirshipFrameworkProxy ships as a Swift package rather than a published pod,
  # so pull it in through React Native's CocoaPods+SPM bridge instead of
  # `s.dependency`.
  spm_dependency(
    s,
    url: "https://github.com/urbanairship/airship-mobile-framework-proxy.git",
    requirement: { kind: "exactVersion", version: "16.0.1" },
    products: ["AirshipFrameworkProxy"]
  )

  # react-native-airship imports AirshipCore/AirshipAutomation/AirshipMessageCenter
  # directly (not just through AirshipFrameworkProxy), so it needs its own
  # dependency edge to the SDK rather than relying on whatever
  # AirshipFrameworkProxy happens to pull in transitively. PreferenceCenter and
  # FeatureFlags aren't used by our own sources, but are included so native
  # extension code (AirshipPluginExtender, etc.) has the same module access
  # the old combined AirshipKit CocoaPods module used to give it.
  spm_dependency(
    s,
    url: "https://github.com/urbanairship/ios-library.git",
    requirement: { kind: "exactVersion", version: "21.0.2" },
    products: [
      "AirshipCore",
      "AirshipAutomation",
      "AirshipMessageCenter",
      "AirshipPreferenceCenter",
      "AirshipFeatureFlags",
      "AirshipScenes"
    ]
  )
end
