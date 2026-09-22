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

  # Our sources import Core/Automation/MessageCenter directly, so this needs
  # its own edge to ios-library. PreferenceCenter/FeatureFlags are unused here
  # but included so native extension code can import them too.
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
