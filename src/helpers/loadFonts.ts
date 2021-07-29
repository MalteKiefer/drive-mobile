import * as Font from 'expo-font';

/**
 * Load fonts from assets
 */
async function loadFontsAsync(): Promise<void> {
  return Font.loadAsync({
    'Averta-Bold': require('../../assets/fonts/Averta-Bold.otf'),
    'Averta-Regular': require('../../assets/fonts/Averta-Regular.otf'),
    'Averta-Extra-Bold': require('../../assets/fonts/Averta-Extra-Bold.otf'),
    'Averta-Light': require('../../assets/fonts/Averta-Light.otf'),
    'Averta-Black': require('../../assets/fonts/Averta-Black.otf'),
    'Averta-Semibold': require('../../assets/fonts/Averta-Semibold.otf'),
    'CerebriSans-Bold': require('../../assets/fonts/CerebriSans-Bold.ttf'),
    'CerebriSans-Medium': require('../../assets/fonts/CerebriSans-Medium.ttf'),
    'CerebriSans-Regular': require('../../assets/fonts/CerebriSans-Regular.ttf'),
    'CircularStd-Bold': require('../../assets/fonts/CircularStd-Bold.ttf'),
    'CircularStd-Black': require('../../assets/fonts/CircularStd-Black.ttf'),
    'CircularStd-Book': require('../../assets/fonts/CircularStd-Book.ttf'),
    'CircularStd-Medium': require('../../assets/fonts/CircularStd-Medium.ttf'),
    'NeueEinstellung-Black': require('../../assets/fonts/NeueEinstellung-Black.otf'),
    'NeueEinstellung-Bold': require('../../assets/fonts/NeueEinstellung-Black.otf'),
    'NeueEinstellung-ExtraBold': require('../../assets/fonts/NeueEinstellung-ExtraBold.otf'),
    'NeueEinstellung-ExtraLight': require('../../assets/fonts/NeueEinstellung-ExtraLight.otf'),
    'NeueEinstellung-Light': require('../../assets/fonts/NeueEinstellung-Light.otf'),
    'NeueEinstellung-Medium': require('../../assets/fonts/NeueEinstellung-Medium.otf'),
    'NeueEinstellung-Regular': require('../../assets/fonts/NeueEinstellung-Regular.otf'),
    'NeueEinstellung-SemiBold': require('../../assets/fonts/NeueEinstellung-SemiBold.otf'),
    'NeueEinstellung-Thin': require('../../assets/fonts/NeueEinstellung-Thin.otf')
  });
}

export const loadFonts = loadFontsAsync
