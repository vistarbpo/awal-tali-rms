import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import { I18nManager, Platform, Text, TextInput } from 'react-native';
import { translations, LangKey, TKey } from './translations';

// ─── Font names (from @expo-google-fonts/ibm-plex-sans-arabic) ────────────────
export const ARABIC_FONTS = {
  regular:  'IBMPlexSansArabic_400Regular',
  medium:   'IBMPlexSansArabic_500Medium',
  semibold: 'IBMPlexSansArabic_600SemiBold',
  bold:     'IBMPlexSansArabic_700Bold',
} as const;

export type FontWeight = keyof typeof ARABIC_FONTS;

// ─── Context ──────────────────────────────────────────────────────────────────
interface I18nContextValue {
  lang:    LangKey;
  isRTL:   boolean;
  t:       (key: TKey) => string;
  setLang: (l: LangKey) => void;
  /** Returns fontFamily for Text components — undefined in English (uses system font) */
  af:      (weight?: FontWeight) => string | undefined;
  /** Inline RTL-aware style for absolute left positions: pass the LTR value */
  rtlLeft:  (val: number) => { left?: number; right?: number };
  /** Inline RTL-aware style for absolute right positions: pass the LTR value */
  rtlRight: (val: number) => { left?: number; right?: number };
  /** textAlign that flips for RTL */
  rtlText:  (align?: 'left' | 'right') => 'left' | 'right';
}

const I18nContext = createContext<I18nContextValue>({
  lang:     'en',
  isRTL:    false,
  t:        key => translations[key]?.en ?? String(key),
  setLang:  () => {},
  af:       () => undefined,
  rtlLeft:  val => ({ left: val }),
  rtlRight: val => ({ right: val }),
  rtlText:  () => 'left',
});

// ─── URL-based initial language (web only) ────────────────────────────────────
function getInitialLang(): LangKey {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/ar')) return 'ar';
  }
  return 'en';
}

// ─── Capture RN default Text/TextInput styles once (before we patch for Arabic) ─
let capturedTextStyle: React.ComponentProps<typeof Text>['style'];
let capturedInputStyle: React.ComponentProps<typeof TextInput>['style'];
let didCaptureTextDefaults = false;

/** RN types omit defaultProps; runtime still supports it (used for Arabic base font). */
type WithDefaultProps = { defaultProps?: { style?: React.ComponentProps<typeof Text>['style'] } };
const TextDP = Text as unknown as WithDefaultProps;
const TextInputDP = TextInput as unknown as WithDefaultProps;

function captureTextDefaults() {
  if (didCaptureTextDefaults) return;
  capturedTextStyle = TextDP.defaultProps?.style;
  capturedInputStyle = TextInputDP.defaultProps?.style;
  didCaptureTextDefaults = true;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangKey>(getInitialLang);
  const isRTL = lang === 'ar';

  // Patch defaultProps during render (not in useLayoutEffect) so the first paint already
  // uses IBM Plex on Arabic — effects run after children render and miss the initial tree.
  captureTextDefaults();
  const arabicWebFamily = 'IBM Plex Sans Arabic';
  const defaultArabicFont = Platform.OS === 'web' ? arabicWebFamily : ARABIC_FONTS.regular;
  const textStyleArabic = [capturedTextStyle, { fontFamily: defaultArabicFont }].filter(Boolean);
  TextDP.defaultProps = {
    ...TextDP.defaultProps,
    style: isRTL ? textStyleArabic : capturedTextStyle,
  };
  TextInputDP.defaultProps = {
    ...TextInputDP.defaultProps,
    style: isRTL ? [capturedInputStyle, { fontFamily: defaultArabicFont }].filter(Boolean) : capturedInputStyle,
  };

  useLayoutEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = isRTL ? 'ar' : 'en';
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  }, [isRTL, lang]);

  function setLang(l: LangKey) {
    setLangState(l);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Sync URL: /ar for Arabic, / for English
      window.history.replaceState(null, '', l === 'ar' ? '/ar' : '/');
    } else {
      I18nManager.forceRTL(l === 'ar');
    }
  }

  function t(key: TKey): string {
    return translations[key]?.[lang] ?? translations[key]?.en ?? String(key);
  }

  function af(weight: FontWeight = 'regular'): string | undefined {
    if (!isRTL) return undefined;
    // Web: font is loaded as "IBM Plex Sans Arabic" via Google Fonts <link> in index.html
    // Native: each weight is a separate named asset from @expo-google-fonts
    return Platform.OS === 'web' ? arabicWebFamily : ARABIC_FONTS[weight];
  }

  function rtlLeft(val: number) {
    return isRTL ? { right: val } : { left: val };
  }

  function rtlRight(val: number) {
    return isRTL ? { left: val } : { right: val };
  }

  function rtlText(align: 'left' | 'right' = 'left'): 'left' | 'right' {
    if (!isRTL) return align;
    return align === 'left' ? 'right' : 'left';
  }

  return (
    <I18nContext.Provider value={{ lang, isRTL, t, setLang, af, rtlLeft, rtlRight, rtlText }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useI18n = () => useContext(I18nContext);
