// Run once:  node scripts/setup-app-json.js
// Sets app name, portrait orientation and automatic light/dark mode in app.json.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app.json');
const json = JSON.parse(fs.readFileSync(file, 'utf8'));
const expo = json.expo || (json.expo = {});

expo.name = 'Thrift Hub';
expo.scheme = 'thrifthub';
expo.orientation = 'portrait';          // portrait lock (layouts are responsive anyway)
expo.userInterfaceStyle = 'automatic';  // REQUIRED for dark mode to follow the phone setting
expo.backgroundColor = '#F5EEDD';

const plugins = expo.plugins || (expo.plugins = []);
const has = (name) => plugins.some((p) => (Array.isArray(p) ? p[0] : p) === name);
if (!has('expo-router')) plugins.push('expo-router');
if (!has('expo-image-picker')) {
  plugins.push(['expo-image-picker', { photosPermission: 'Thrift Hub needs your photos so you can add pictures to listings and your profile.' }]);
}

fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log('app.json updated: name, orientation=portrait, userInterfaceStyle=automatic');
