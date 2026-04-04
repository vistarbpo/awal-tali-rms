import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:  boolean;
  current:  string;
  onClose:  () => void;
  onSave:   (name: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CallNameDialog({ visible, current, onClose, onSave }: Props) {
  const { t, af, isRTL } = useI18n();
  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setValue(current);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  function handleSave() {
    onSave(value.trim());
    onClose();
  }

  const cardJSX = (
    <View style={s.card}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerSide} onPress={onClose} activeOpacity={0.7}>
          <Text style={[s.cancelText, { fontFamily: af('medium') }]}>{t('cancel')}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, { fontFamily: af('bold') }]}>{t('callName')}</Text>
        </View>
        <TouchableOpacity style={s.headerSide} onPress={handleSave} activeOpacity={0.7}>
          <Text style={[s.saveText, { fontFamily: af('bold'), textAlign: isRTL ? 'left' : 'right' }]}>{t('save')}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Input area ── */}
      <View style={s.inputArea}>
        <View style={s.inputWrap}>
          <TextInput
            ref={inputRef}
            style={[s.input, { fontFamily: af('medium'), textAlign: isRTL ? 'right' : 'left' }]}
            value={value}
            onChangeText={setValue}
            placeholder={t('callNamePlaceholder')}
            placeholderTextColor={Colors.placeholder}
            returnKeyType="done"
            onSubmitEditing={handleSave}
            autoCapitalize="words"
            autoCorrect={false}
            // @ts-ignore
            outlineWidth={0}
          />
          {value.length > 0 && (
            <TouchableOpacity style={s.clearBtn} onPress={() => setValue('')} activeOpacity={0.7}>
              <Text style={s.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Hint ── */}
      <View style={s.hintRow}>
        <Text style={[s.hintText, { fontFamily: af('regular') }]}>{t('callNameHint')}</Text>
      </View>

    </View>
  );

  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <View style={s.inlineOverlay}>
        {cardJSX}
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>
      <View style={s.center} pointerEvents="box-none">
        {cardJSX}
      </View>
    </Modal>
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
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  card: {
    width: 400,
    backgroundColor: Colors.white,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 16,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  headerSide: {
    width: 72,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },

  // ── Input ──
  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    height: 60,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: -0.2,
    outlineWidth: 0,
    outlineStyle: 'none',
  } as any,
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.grayMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },

  // ── Hint ──
  hintRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  hintText: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },
});
