import { Platform } from 'react-native';

const REWARDED_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-9015796764047989/6516519105', 
  android: 'ca-app-pub-9015796764047989/5272554348',
});

export { REWARDED_AD_UNIT_ID };
