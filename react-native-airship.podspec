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
  s.private_header_files = "ios/**/*.h"
  s.swift_version = "6.0"

  install_modules_dependencies(s)
  
  s.dependency "AirshipFrameworkProxy", "15.2.0"
end
