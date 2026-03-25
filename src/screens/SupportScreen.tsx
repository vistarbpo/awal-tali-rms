import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { iconHeadset } from '../assets/icons';

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPPORT_PHONE    = '+966 50 123 4567';
const SUPPORT_WHATSAPP = '+966 50 123 4567';

// ─── QR Code ─────────────────────────────────────────────────────────────────
// Proper 21×21 QR structure — replace with a real QR image asset in production
// Finder patterns (TL/TR/BL) are structurally correct; data area is decorative.
const QR_MATRIX: number[][] = [
  [1,1,1,1,1,1,1, 0, 1,0,0,1,0, 0, 1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1, 0, 0,1,1,0,1, 0, 1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1, 0, 1,0,1,0,0, 0, 1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1, 0, 0,1,0,1,1, 0, 1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1, 0, 1,0,0,0,1, 0, 1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1, 0, 0,0,1,0,0, 0, 1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1, 0, 1,0,1,0,1, 0, 1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0, 0, 0,1,0,1,1, 1, 0,0,0,0,0,0,0],
  [1,1,0,1,0,0,1, 1, 0,1,1,0,0, 1, 0,1,0,1,1,0,1],
  [0,0,1,0,1,1,0, 0, 1,0,0,1,1, 0, 1,0,1,0,0,1,0],
  [1,0,0,1,0,1,1, 1, 0,1,0,0,1, 1, 0,1,0,1,1,0,0],
  [0,1,1,0,1,0,0, 0, 1,0,1,1,0, 0, 1,0,0,1,0,1,1],
  [1,0,1,0,0,1,0, 1, 0,0,0,1,1, 1, 0,1,1,0,0,1,0],
  [0,1,0,1,1,0,1, 0, 1,1,0,0,1, 0, 1,0,0,1,1,0,1],
  [1,1,1,1,1,1,1, 0, 0,1,1,0,0, 1, 0,1,0,1,0,0,0],
  [1,0,0,0,0,0,1, 0, 1,0,0,1,1, 0, 1,0,1,0,1,1,0],
  [1,0,1,1,1,0,1, 0, 0,1,0,0,1, 1, 0,0,1,0,0,1,1],
  [1,0,1,1,1,0,1, 0, 1,0,1,1,0, 0, 1,1,0,1,1,0,0],
  [1,0,1,1,1,0,1, 0, 0,1,0,0,1, 1, 0,0,1,0,0,1,0],
  [1,0,0,0,0,0,1, 0, 1,0,0,1,0, 0, 1,0,0,1,0,1,1],
  [1,1,1,1,1,1,1, 0, 0,1,1,0,1, 1, 0,1,0,0,1,0,0],
];

function QRCode({ size = 164 }: { size?: number }) {
  const rows   = QR_MATRIX.length;
  const cols   = QR_MATRIX[0].length;
  const cell   = size / cols;
  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff', borderRadius: 8 }}>
      {QR_MATRIX.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', height: cell }}>
          {row.map((bit, ci) => (
            <View
              key={ci}
              style={{
                width: cell,
                height: cell,
                backgroundColor: bit ? '#111' : '#fff',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SupportScreen({ visible, onClose }: Props) {
  return (
    <Modal
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

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
              <Text style={s.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Support</Text>
            <View style={s.closeBtn} />
          </View>

          {/* ── Hero ── */}
          <View style={s.hero}>
            <View style={s.heroLeft}>
              <View style={s.heroIconRing}>
                <Image source={iconHeadset} style={s.heroIcon} />
              </View>
            </View>
            <View style={s.heroRight}>
              <Text style={s.heroTitle}>How can we help?</Text>
              <Text style={s.heroSub}>
                Our support team is available around the clock to keep your business running smoothly.
              </Text>
              <View style={s.heroOnline}>
                <View style={s.onlineDot} />
                <Text style={s.onlineText}>Support team is online</Text>
              </View>
            </View>
          </View>

          {/* ── Divider ── */}
          <View style={s.divider} />

          {/* ── Contact Methods ── */}
          <View style={s.contactRow}>

            {/* Phone Card */}
            <View style={s.contactCard}>
              <View style={s.cardIconRow}>
                <View style={[s.cardIconWrap, s.phoneIconWrap]}>
                  <Text style={s.cardIconEmoji}>📞</Text>
                </View>
                <View>
                  <Text style={s.cardType}>CALL SUPPORT</Text>
                  <Text style={s.cardHint}>Direct hotline</Text>
                </View>
              </View>
              <View style={s.numberBlock}>
                <Text style={s.numberText}>{SUPPORT_PHONE}</Text>
              </View>
              <View style={s.cardFooter}>
                <View style={s.availBadge}>
                  <View style={s.availDot} />
                  <Text style={s.availText}>Available 24 / 7</Text>
                </View>
              </View>
            </View>

            {/* Vertical separator */}
            <View style={s.vertSep} />

            {/* WhatsApp Card */}
            <View style={s.contactCard}>
              <View style={s.cardIconRow}>
                <View style={[s.cardIconWrap, s.waIconWrap]}>
                  <Text style={s.cardIconEmoji}>💬</Text>
                </View>
                <View>
                  <Text style={s.cardType}>WHATSAPP</Text>
                  <Text style={s.cardHint}>Scan or save number</Text>
                </View>
              </View>

              {/* QR + shadow frame */}
              <View style={s.qrFrame}>
                <QRCode size={156} />
              </View>

              <Text style={s.numberText}>{SUPPORT_WHATSAPP}</Text>
              <Text style={s.qrHint}>Scan with your camera or WhatsApp app</Text>
            </View>

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
    width: 700,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 40,
    elevation: 20,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: Colors.grayText,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -0.3,
  },

  // ── Hero ──
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 26,
    gap: 20,
  },
  heroLeft: {
    alignItems: 'center',
  },
  heroIconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  heroRight: { flex: 1 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: -0.2,
    lineHeight: 20,
    marginBottom: 12,
  },
  heroOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: -0.1,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },

  // ── Contact row ──
  contactRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundAlt,
  },
  contactCard: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 28,
    alignItems: 'center',
  },
  vertSep: {
    width: 1,
    backgroundColor: Colors.grayBorder,
    marginVertical: 24,
  },

  // ── Card internals ──
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconWrap: {
    backgroundColor: Colors.primaryLight,
  },
  waIconWrap: {
    backgroundColor: '#E8F5E9',
  },
  cardIconEmoji: {
    fontSize: 22,
  },
  cardType: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.grayText,
    letterSpacing: 0.9,
  },
  cardHint: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.placeholder,
    marginTop: 1,
  },

  // ── Number ──
  numberBlock: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 16,
    marginBottom: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  numberText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },

  // ── Availability ──
  cardFooter: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  availText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D',
    letterSpacing: -0.1,
  },

  // ── QR ──
  qrFrame: {
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  qrHint: {
    fontSize: 12,
    color: Colors.grayText,
    textAlign: 'center',
    letterSpacing: -0.1,
    lineHeight: 17,
  },
});
