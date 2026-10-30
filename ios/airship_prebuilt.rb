# Copyright Airship and Contributors

require 'json'
require 'fileutils'

module AirshipPrebuilt
  SOURCE_URL = 'https://github.com/urbanairship/ios-library.git'
  PREBUILT_URL = 'https://github.com/urbanairship/ios-library-prebuilt.git'

  # The ios-library products react-native-airship links. The prebuilt ones are
  # dynamic, and Xcode only embeds package frameworks linked by the app target.
  PLUGIN_PRODUCTS = %w[
    AirshipCore
    AirshipAutomation
    AirshipMessageCenter
    AirshipPreferenceCenter
    AirshipFeatureFlags
    AirshipScenes
  ].freeze

  module_function

  # Points the workspace's `ios-library` mirror at `url` and returns whether
  # the mirror changed.
  #
  # Other entries in `mirrors.json` are kept. An existing mirror of
  # `ios-library` to anywhere else is left alone with a warning, since one
  # package can only have one mirror.
  #
  # @param swiftpm_dir [String] the workspace's `xcshareddata/swiftpm` directory
  # @param url [String] the prebuilt package's repository URL
  # @param enabled [Boolean] add the mirror when true, remove it when false
  # @return [Boolean] true if `mirrors.json` was written or removed
  def update_mirror(swiftpm_dir, url, enabled)
    path = File.join(swiftpm_dir, 'configuration', 'mirrors.json')
    config = File.exist?(path) ? JSON.parse(File.read(path)) : { 'object' => [], 'version' => 1 }
    mirrors = config['object']
    existing = mirrors.find { |entry| entry['original'] == SOURCE_URL }

    if existing && existing['mirror'] != url
      Pod::UI.warn "[Airship] #{SOURCE_URL} is already mirrored to #{existing['mirror']}; leaving it in place." if enabled
      return false
    end
    return false if enabled == !existing.nil?

    if enabled
      mirrors << { 'mirror' => url, 'original' => SOURCE_URL }
    else
      mirrors.delete(existing)
    end

    if mirrors.empty?
      FileUtils.rm_f(path)
      FileUtils.rmdir(File.dirname(path)) if Dir.empty?(File.dirname(path))
    else
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, JSON.pretty_generate(config) + "\n")
    end
    true
  end

  # Drops the `ios-library` pin so Xcode re-resolves it against the new
  # location while every other package stays locked.
  #
  # @param swiftpm_dir [String] the workspace's `xcshareddata/swiftpm` directory
  def remove_pin(swiftpm_dir)
    path = File.join(swiftpm_dir, 'Package.resolved')
    return unless File.exist?(path)

    resolved = JSON.parse(File.read(path))
    pins = resolved['pins'] || []
    # A mirror's pin keeps the original URL as its location but may take its identity from the mirror.
    return unless pins.reject! { |pin| pin['location'] == SOURCE_URL }

    File.write(path, JSON.pretty_generate(resolved) + "\n")
  end

  # Returns the app project's `ios-library` package reference, adding one with
  # the Pods project's version requirement if the app doesn't have one.
  #
  # @param project [Xcodeproj::Project] the app's user project
  # @param requirement [Hash] the requirement react-native-airship pins
  # @return [Xcodeproj::Project::Object::XCRemoteSwiftPackageReference]
  def package_reference(project, requirement)
    reference = project.root_object.package_references.find { |ref| ref.repositoryURL == SOURCE_URL }
    return reference if reference

    reference = project.new(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
    reference.repositoryURL = SOURCE_URL
    reference.requirement = requirement
    project.root_object.package_references << reference
    reference
  end

  # Returns the ios-library products the app target must link: the plugin's,
  # plus any linked by other targets, since app extensions load their
  # frameworks from the app's `Frameworks` directory.
  #
  # @param project [Xcodeproj::Project] the app's user project
  # @param app_target [Xcodeproj::Project::Object::PBXNativeTarget] the app target
  # @return [Array<String>] product names
  def products_for(project, app_target)
    extension_products = (project.native_targets - [app_target]).flat_map do |target|
      target.package_product_dependencies
            .select { |dep| dep.package.respond_to?(:repositoryURL) && dep.package.repositoryURL == SOURCE_URL }
            .map(&:product_name)
    end
    (PLUGIN_PRODUCTS + extension_products).uniq
  end

  # Links or unlinks the Airship products on the app target.
  #
  # @param project [Xcodeproj::Project] the app's user project
  # @param target [Xcodeproj::Project::Object::PBXNativeTarget] the app target
  # @param requirement [Hash] the requirement react-native-airship pins
  # @param enabled [Boolean] link the products when true, unlink them when false
  def update_app_target(project, target, requirement, enabled)
    products = products_for(project, target)
    linked = target.package_product_dependencies.select { |dep| products.include?(dep.product_name) }

    unless enabled
      linked.each do |dependency|
        target.frameworks_build_phase.files.select { |file| file.product_ref == dependency }.each(&:remove_from_project)
        target.package_product_dependencies.delete(dependency)
        dependency.remove_from_project
      end
      return
    end

    reference = package_reference(project, requirement)
    (products - linked.map(&:product_name)).each do |product|
      dependency = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
      dependency.package = reference
      dependency.product_name = product
      target.package_product_dependencies << dependency

      build_file = project.new(Xcodeproj::Project::Object::PBXBuildFile)
      build_file.product_ref = dependency
      target.frameworks_build_phase.files << build_file
    end
  end
end

# Builds against the prebuilt Airship iOS SDK instead of compiling it from
# source. Call it from `post_install`.
#
# Enabling mirrors `ios-library` to the prebuilt package in the workspace and
# links the Airship products on each app target so Xcode embeds the dynamic
# frameworks. `enabled: false` removes the mirror and unlinks those products
# from app targets, including any the app linked itself.
#
# @param installer [Pod::Installer] the `post_install` installer
# @param enabled [Boolean] whether to use the prebuilt SDK
# @param url [String] the prebuilt package's repository URL, for hosting a copy
def airship_use_prebuilt!(installer, enabled: true, url: AirshipPrebuilt::PREBUILT_URL)
  pods_reference = installer.pods_project.root_object.package_references.find do |ref|
    ref.repositoryURL == AirshipPrebuilt::SOURCE_URL
  end
  raise '[Airship] ios-library is missing from the Pods project; is react-native-airship installed?' unless pods_reference

  installer.aggregate_targets.group_by(&:user_project).each do |project, aggregate_targets|
    app_targets = aggregate_targets.flat_map(&:user_targets).select { |target| target.symbol_type == :application }
    app_targets.each do |target|
      AirshipPrebuilt.update_app_target(project, target, pods_reference.requirement, enabled)
    end
    project.save
  end

  root = installer.config.installation_root
  workspace = installer.podfile.workspace_path ||
              "#{File.basename(installer.aggregate_targets.first.user_project.path, '.xcodeproj')}.xcworkspace"
  swiftpm_dir = File.join(File.expand_path(workspace, root), 'xcshareddata', 'swiftpm')
  AirshipPrebuilt.remove_pin(swiftpm_dir) if AirshipPrebuilt.update_mirror(swiftpm_dir, url, enabled)
end
