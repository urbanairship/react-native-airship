// example/metro.config.js

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

// Find the project root, which is one level up from the example directory.
const projectRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get the name of your library from the root package.json
const libraryName = packageJson.name;

// Define paths
const rootNodeModules = path.resolve(projectRoot, 'node_modules');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // 1. Watch all files in the monorepo
  watchFolders: [projectRoot],

  resolver: {
    // 2. Let Metro know where to resolve packages from
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'), // Local node_modules in example
      rootNodeModules, // Main node_modules in root
    ],
    // 3. Force Metro to resolve symlinked packages from the root node_modules
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === libraryName) {
            // Redirect your own library's import to its source code
            return path.join(projectRoot, packageJson.source);
          }
          // Redirect any other module to the root node_modules
          return path.join(rootNodeModules, name);
        },
      }
    ),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);