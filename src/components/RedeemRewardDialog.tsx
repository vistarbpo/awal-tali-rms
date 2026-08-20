import React, { useState, useEffect } from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:     boolean;
  code:        string;
  onClose:     () => void;
  onApply:     (code: string) => void;
  onScanPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RedeemRewardDialog({ visible, code, onClose, onApply, onScanPress }: Props) {
  const { t, af, isRTL } = useI18n();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue(code);
  }, [visible, code]);

  function handleApply() {
    if (!value.trim()) return;
    onApply(value.trim());
    onClose();
  }

  return (
    <RootModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* Header */}
          <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.sideBtn}>
              <Text style={[s.cancelText, { fontFamily: af('medium') }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={[s.title, { fontFamily: af('semibold') }]}>{t('redeemTitle')}</Text>
            <TouchableOpacity onPress={handleApply} activeOpacity={0.7} style={s.sideBtn}>
              <Text style={[s.applyText, !value.trim() && s.applyDisabled, { fontFamily: af('semibold') }]}>{t('apply')}</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Code input */}
          <View style={s.body}>
            <TextInput
              style={[s.codeInput, { fontFamily: af('semibold') }]}
              textAlign="center"
              value={value}
              onChangeText={setValue}
              placeholder={t('redeemCodePlaceholder')}
              placeholderTextColor={Colors.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleApply}
            />
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Empty hint area */}
          <View style={s.hint}>
            <Text style={[s.hintText, { fontFamily: af('regular') }]}>
              <Text
                style={[s.hintScanLink, { fontFamily: af('bold') }]}
                onPress={() => { onClose(); onScanPress?.(); }}
              >{t('redeemScanVerb')}</Text>
              {t('redeemHintRemainder')}
            </Text>
          </View>

        </View>
      </View>
    </RootModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 560,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    height: 64,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  sideBtn: {
    width: 80,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.3,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  applyDisabled: {
    opacity: 0.35,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },

  // Code input area
  body: {
    paddingVertical: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  codeInput: {
    width: '100%',
    fontSize: 28,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 2,
    padding: 0,
    height: 48,
  } as any,

  // Hint
  hint: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayText,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  hintScanLink: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
