const path = require('path');

const extraNodeModules = new Proxy(
  {
    'urbanairship-react-native': path.resolve(__dirname, '../urbanairship-react-native'),
    'urbanairship-location-react-native': path.resolve(__dirname, '../urbanairship-location-react-native'),
  },
  {
    get: (target, name) => {
      if (target.hasOwnProperty(name)) {
        return target[name];
      }
      return path.join(process.cwd(), `node_modules/${name}`);
    },
  },
);

const watchFolders = [
  path.resolve(__dirname, '../urbanairship-react-native'),
  path.resolve(__dirname, '../urbanairship-location-react-native'),
  path.resolve(__dirname, '../node_modules'),
];

module.exports = {
  projectRoot: path.resolve(__dirname),
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules,
    sourceExts: ['js', 'jsx', 'ts', 'tsx'],
  },
  watchFolders,
};
