import { Platform } from 'react-native';

const REWARDED_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-9015796764047989/6516519105', // TEST ID — replace before release
  android: 'ca-app-pub-3940256099942544/5224354917', // TEST ID — replace before release
});

export { REWARDED_AD_UNIT_ID };
