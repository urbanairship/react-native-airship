require "json"

 fabric_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

 package = JSON.parse(File.read(File.join(__dir__, "package.json")))

 Pod::Spec.new do |s|
  s.name         = "urbanairship-react-native"
  s.version      = package["version"]
  s.summary      = package['description']
  s.author       = package['author']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.platform     = :ios, "13.0"
  s.source       = { :git => "https://github.com/urbanairship/react-native-module.git", :tag => "{s.version}" }
  s.source_files  = "ios/**/*"

  if fabric_enabled
    folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

    s.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/boost" "$(PODS_ROOT)/boost-for-react-native"  "$(PODS_ROOT)/RCT-Folly"',
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    }

    s.compiler_flags  = folly_compiler_flags + ' -DRN_FABRIC_ENABLED -fmodules -fcxx-modules'
    s.requires_arc    = true

    s.dependency "React"
    s.dependency "React-RCTFabric"
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  else
    s.compiler_flags = "-fmodules -fcxx-modules"

    s.dependency "React-Core"
  end

  s.dependency "Airship", "16.10.5"
  s.dependency "Airship/PreferenceCenter", "16.10.5"

end
