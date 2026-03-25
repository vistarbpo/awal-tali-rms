import React from 'react';
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
import TalabOSLogo from '../components/TalabOSLogo';

interface Props {
  userName?: string;
  userCode?: string;
  branchName?: string;
  isClockedIn?: boolean;
  onClockToggle?: () => void;
  onAccessRegister?: () => void;
  onExit?: () => void;
}

export default function WelcomeScreen({
  userName = 'Mohammed',
  userCode = '558665',
  branchName = 'Ar Rashidiyya Branch',
  isClockedIn = false,
  onClockToggle,
  onAccessRegister,
  onExit,
}: Props) {
  const initials = userName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={s.row}>

        {/* ── LEFT: Brand panel (same as Login for consistency) ── */}
        <View style={s.brand}>
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

          <View style={s.userCard}>
            <View style={s.userAvatar}>
              <Text style={s.userAvatarText}>{initials}</Text>
            </View>
            <View style={s.userDetails}>
              <Text style={s.userName}>{userName}</Text>
              <Text style={s.userMeta}>{userCode}  ·  {branchName}</Text>
            </View>
          </View>
        </View>

        {/* ── RIGHT: Welcome panel ── */}
        <View style={s.right}>
          <View style={s.card}>

            {/* Greeting */}
            <View style={s.greeting}>
              <Text style={s.greetingTitle}>Welcome back,</Text>
              <Text style={s.greetingName}>{userName}!</Text>
            </View>

            {/* Clock status badge */}
            <View style={[s.badge, isClockedIn ? s.badgeIn : s.badgeOut]}>
              <View style={[s.badgeDot, isClockedIn ? s.badgeDotIn : s.badgeDotOut]} />
              <Text style={[s.badgeText, isClockedIn ? s.badgeTextIn : s.badgeTextOut]}>
                {isClockedIn ? 'Clocked In' : 'Not Clocked In'}
              </Text>
            </View>

            {/* Divider */}
            <View style={s.divider} />

            {/* Actions */}
            <View style={s.actions}>

              {/* Clock In / Clock Out — primary */}
              <TouchableOpacity
                style={[s.btn, s.btnPrimary]}
                onPress={onClockToggle}
                activeOpacity={0.85}
              >
                <Text style={s.btnPrimaryText}>
                  {isClockedIn ? 'Clock Out' : 'Clock In'}
                </Text>
              </TouchableOpacity>

              {/* Access Register — secondary */}
              <TouchableOpacity
                style={[s.btn, s.btnSecondary]}
                onPress={onAccessRegister}
                activeOpacity={0.8}
              >
                <Text style={s.btnSecondaryText}>Access Register</Text>
              </TouchableOpacity>

            </View>

            {/* Exit — destructive link */}
            <TouchableOpacity
              style={s.exitBtn}
              onPress={onExit}
              activeOpacity={0.6}
            >
              <Text style={s.exitText}>Exit</Text>
            </TouchableOpacity>

          </View>
        </View>

      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },

  /* ── Brand panel (consistent with Login) ── */
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

  /* ── Right panel ── */
  right: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },

  /* Welcome card */
  card: {
    width: 400,
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 36,
    paddingTop: 36,
    paddingBottom: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },

  /* Greeting */
  greeting: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 2,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.2,
  },
  greetingName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.8,
  },

  /* Status badge */
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 28,
  },
  badgeIn: {
    backgroundColor: 'rgba(76,175,130,0.12)',
  },
  badgeOut: {
    backgroundColor: Colors.primaryLight,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeDotIn: {
    backgroundColor: Colors.green,
  },
  badgeDotOut: {
    backgroundColor: Colors.grayMid,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  badgeTextIn: {
    color: Colors.green,
  },
  badgeTextOut: {
    color: Colors.grayText,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
    width: '100%',
    marginBottom: 28,
  },

  /* Action buttons */
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  btn: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  btnSecondaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.2,
  },

  /* Exit */
  exitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  exitText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.red,
    letterSpacing: -0.1,
  },
});
