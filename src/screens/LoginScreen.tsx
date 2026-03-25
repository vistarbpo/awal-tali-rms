import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors } from '../constants/colors';
import TalabOSLogo    from '../components/TalabOSLogo';
import SyncDataDialog from '../components/SyncDataDialog';

const PIN_LENGTH = 5;

const KEYPAD: (string | null)[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', null, 'C'],
];

interface Props {
  onLoginSuccess?: () => void;
  onDesignSystem?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onDesignSystem }: Props) {
  const [pin, setPin] = useState('');
  const [syncUsersVisible, setSyncUsersVisible] = useState(false);

  function handleKey(key: string) {
    if (key === 'C') {
      setPin(prev => prev.slice(0, -1));
      return;
    }
    if (pin.length < PIN_LENGTH) {
      const next = pin + key;
      setPin(next);
      if (next.length === PIN_LENGTH) {
        setTimeout(() => { onLoginSuccess?.(); setPin(''); }, 300);
      }
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={s.row}>

        {/* ── LEFT: Brand panel ── */}
        <View style={s.brand}>
          {/* Logo block */}
          <View style={s.logoWrap}>
            <View style={s.brandCircle}>
              <Image
                source={require('../../assets/awaltali-logo.jpg')}
                style={s.brandCircleImg}
                resizeMode="cover"
              />
            </View>
            <TalabOSLogo width={200} color={Colors.white} />
          </View>

          {/* Bottom: user info */}
          <View style={s.userCard}>
            <View style={s.userAvatar}>
              <Text style={s.userAvatarText}>M</Text>
            </View>
            <View style={s.userDetails}>
              <Text style={s.userName}>Mohammed</Text>
              <Text style={s.userMeta}>558665  ·  Ar Rashidiyya Branch</Text>
            </View>
          </View>
        </View>

        {/* ── RIGHT: PIN entry ── */}
        <View style={s.pinPanel}>

          {/* Header */}
          <View style={s.pinHeader}>
            <Text style={s.pinTitle}>Welcome back!</Text>
            <Text style={s.pinSubtitle}>Enter your 5-digit PIN to continue</Text>
          </View>

          {/* PIN dots */}
          <View style={s.pinDots}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[s.dot, i < pin.length && s.dotFilled]}
              />
            ))}
          </View>

          {/* Keypad */}
          <View style={s.keypad}>
            {KEYPAD.map((row, ri) => (
              <View key={ri} style={s.keyRow}>
                {row.map((key, ci) => {
                  if (key === null) return <View key={ci} style={s.key} />;
                  const isDelete = key === 'C';
                  return (
                    <TouchableOpacity
                      key={ci}
                      style={[s.key, isDelete && s.keyDelete]}
                      onPress={() => handleKey(key)}
                      activeOpacity={0.65}
                    >
                      <Text style={[s.keyText, isDelete && s.keyDeleteText]}>
                        {key === 'C' ? '⌫' : key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Sync */}
            <TouchableOpacity style={s.syncBtn} activeOpacity={0.7} onPress={() => setSyncUsersVisible(true)}>
              <Text style={s.syncText}>Sync Users</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      <SyncDataDialog
        visible={syncUsersVisible}
        onClose={() => setSyncUsersVisible(false)}
        title="Sync Users"
      />

      {/* ── Design System icon — top right ── */}
      {onDesignSystem && (
        <TouchableOpacity style={s.dsBtn} onPress={onDesignSystem} activeOpacity={0.7}>
          <Text style={s.dsBtnText}>⬡</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const KEY_SIZE = 84;
const KEY_GAP  = 12;

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  /* ── Brand panel ── */
  brand: {
    width: 360,
    backgroundColor: Colors.primary,
    paddingHorizontal: 36,
    paddingTop: 40,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  logoWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  brandCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandCircleImg: {
    width: 96,
    height: 96,
  },
  dsBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dsBtnText: {
    fontSize: 18,
    color: Colors.goldShade,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.yellowGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  userDetails: {
    gap: 3,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.1,
  },
  userMeta: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.1,
  },

  /* ── PIN panel ── */
  pinPanel: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 48,
  },
  pinHeader: {
    alignItems: 'center',
    gap: 8,
  },
  pinTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.5,
  },
  pinSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.1,
  },

  /* PIN dots */
  pinDots: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.grayBorder,
    borderWidth: 1.5,
    borderColor: Colors.grayMid,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  /* Keypad */
  keypad: {
    gap: KEY_GAP,
    alignItems: 'center',
  },
  keyRow: {
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  keyDelete: {
    backgroundColor: Colors.primaryLight,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
  },
  keyDeleteText: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '600',
  },

  syncBtn: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  syncText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grayText,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
