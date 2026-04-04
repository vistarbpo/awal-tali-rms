import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

interface Props {
  /** 'light' — for dark backgrounds (brand panel), 'dark' — for light backgrounds */
  variant?: 'light' | 'dark';
}

export default function LangToggle({ variant = 'dark' }: Props) {
  const { lang, setLang, af } = useI18n();
  const isLight = variant === 'light';

  return (
    <View style={s.row}>
      <TouchableOpacity
        style={[s.btn, lang === 'en' && (isLight ? s.activeLt : s.activeDk)]}
        onPress={() => setLang('en')}
        activeOpacity={0.75}
      >
        <Text style={[
          s.label,
          isLight ? s.labelLt : s.labelDk,
          lang === 'en' && (isLight ? s.activeLabelLt : s.activeLabelDk),
        ]}>
          EN
        </Text>
      </TouchableOpacity>

      <View style={[s.sep, isLight ? s.sepLt : s.sepDk]} />

      <TouchableOpacity
        style={[s.btn, lang === 'ar' && (isLight ? s.activeLt : s.activeDk)]}
        onPress={() => setLang('ar')}
        activeOpacity={0.75}
      >
        <Text style={[
          s.label,
          { fontFamily: lang === 'ar' ? af('semibold') : undefined },
          isLight ? s.labelLt : s.labelDk,
          lang === 'ar' && (isLight ? s.activeLabelLt : s.activeLabelDk),
        ]}>
          AR
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sep: {
    width: 1,
    height: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  /* Light variant — on dark (primary) backgrounds */
  sepLt:         { backgroundColor: 'rgba(255,255,255,0.2)' },
  labelLt:       { color: 'rgba(255,255,255,0.5)' },
  activeLt:      { backgroundColor: 'rgba(255,255,255,0.15)' },
  activeLabelLt: { color: Colors.white },

  /* Dark variant — on light backgrounds */
  sepDk:         { backgroundColor: Colors.grayBorder },
  labelDk:       { color: Colors.grayText },
  activeDk:      { backgroundColor: Colors.primaryLight },
  activeLabelDk: { color: Colors.primary },
});
