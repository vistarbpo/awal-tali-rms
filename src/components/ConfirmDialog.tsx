import React from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onNo: () => void;
  onYes: () => void;
}

export default function ConfirmDialog({ visible, title, message, onNo, onYes }: Props) {
  const { t, af } = useI18n();
  return (
    <RootModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onNo}
    >
      <TouchableWithoutFeedback onPress={onNo}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* Icon accent */}
          <View style={s.iconWrap}>
            <View style={s.iconDot} />
          </View>

          {/* Text */}
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>

          {/* Actions */}
          <View style={s.actions}>
            <TouchableOpacity style={s.btnNo} onPress={onNo} activeOpacity={0.7}>
              <Text style={[s.btnNoText, { fontFamily: af('semibold') }]}>{t('no')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnYes} onPress={onYes} activeOpacity={0.8}>
              <Text style={[s.btnYesText, { fontFamily: af('bold') }]}>{t('yes')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </RootModal>
  );
}

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
    width: 360,
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
  },

  /* Accent dot */
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: 23,
    letterSpacing: -0.1,
    marginBottom: 32,
  },

  /* Button row */
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnNo: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnNoText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
  btnYes: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnYesText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.1,
  },
});
