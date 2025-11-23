// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use the SVG transformer so we can: import Icon from './icon.svg'
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Tell Metro that .svg files are source, not assets
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
