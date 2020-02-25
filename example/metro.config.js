const path = require('path');

const extraNodeModules = new Proxy(
  {
    'urbanairship-react-native': path.resolve(__dirname, '../src'),
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
  path.resolve(__dirname, '../src'),
  path.resolve(__dirname, '../node_modules'),
];

module.exports = {
  projectRoot: path.resolve(__dirname),
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules,
    sourceExts: ['js', 'jsx'],
  },
  watchFolders,
};