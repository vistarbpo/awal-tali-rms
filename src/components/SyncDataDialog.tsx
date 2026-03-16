import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:  boolean;
  onClose:  () => void;
  title?:   string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SyncDataDialog({ visible, onClose, title = 'Sync Data' }: Props) {
  const [phase, setPhase] = useState<'syncing' | 'done'>('syncing');

  const spinA       = useRef(new Animated.Value(0)).current;
  const spinB       = useRef(new Animated.Value(0)).current;
  const loopRef     = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset and start every time the dialog opens
  useEffect(() => {
    if (!visible) return;

    setPhase('syncing');
    spinA.setValue(0);
    spinB.setValue(0);

    loopRef.current = Animated.loop(
      Animated.parallel([
        Animated.timing(spinA, { toValue: 1, duration: 900,  useNativeDriver: true, isInteraction: false }),
        Animated.timing(spinB, { toValue: 1, duration: 1400, useNativeDriver: true, isInteraction: false }),
      ])
    );
    loopRef.current.start();

    timerRef.current = setTimeout(() => {
      loopRef.current?.stop();
      setPhase('done');
    }, 2600);

    return () => {
      loopRef.current?.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  function handleClose() {
    loopRef.current?.stop();
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
  }

  const rotateA = spinA.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '360deg'] });
  const rotateB = spinB.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'  ] });

  const isSyncing = phase === 'syncing';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={isSyncing ? undefined : handleClose}
    >
      {!isSyncing && (
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>
      )}
      {isSyncing && <View style={s.backdrop} />}

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>

          {/* ── Header ── */}
          <View style={s.header}>
            <View style={s.headerSide} />
            <Text style={s.headerTitle}>{title}</Text>
            <TouchableOpacity
              style={s.headerSide}
              onPress={handleClose}
              disabled={isSyncing}
              activeOpacity={0.7}
            >
              <Text style={[s.closeText, isSyncing && s.closeDisabled]}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* ── Body ── */}
          <View style={s.body}>

            {/* Spinner / checkmark */}
            <View style={s.spinnerWrap}>
              {isSyncing ? (
                <>
                  <Animated.View style={[s.ring, s.ringOuter, { transform: [{ rotate: rotateA }] }]} />
                  <Animated.View style={[s.ring, s.ringInner, { transform: [{ rotate: rotateB }] }]} />
                </>
              ) : (
                <View style={s.checkCircle}>
                  <Text style={s.checkMark}>✓</Text>
                </View>
              )}
            </View>

            {/* Status text */}
            <Text style={[s.statusText, !isSyncing && s.statusDone]}>
              {isSyncing ? 'Syncing data…' : 'Sync complete'}
            </Text>

            {isSyncing && (
              <Text style={s.subText}>
                Please wait while updates are applied.
              </Text>
            )}

          </View>

        </View>
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
  card: {
    width: 360,
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.grayLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  headerSide: { width: 56 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'right',
    letterSpacing: -0.2,
  },
  closeDisabled: {
    color: Colors.grayMid,
  },

  // Body
  body: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 52,
    paddingHorizontal: 24,
  },

  // Spinner
  spinnerWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
  },
  ringOuter: {
    width: 96,
    height: 96,
    borderWidth: 5,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringInner: {
    width: 64,
    height: 64,
    borderWidth: 5,
    borderColor: Colors.primary,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    opacity: 0.55,
  },

  // Done state
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 36,
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 44,
  },

  // Text
  statusText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  statusDone: {
    color: Colors.green,
  },
  subText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayText,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
