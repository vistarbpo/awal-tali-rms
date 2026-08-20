import React, { useState, useEffect } from 'react';
import RootModal from './RootModal';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';

// ─── Preview mode (Figma capture) — 'scanning' | 'denied' | null ─────────────
const PREVIEW_STATE: 'scanning' | 'denied' | null = null;

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible:  boolean;
  onClose:  () => void;
  onScanned: (code: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ScanLoyaltyQRModal({ visible, onClose, onScanned }: Props) {
  const { t, af, isRTL } = useI18n();
  const [facing, setFacing]         = useState<'front' | 'back'>('back');
  const [hasPermission, setPermission] = useState<boolean | null>(
    PREVIEW_STATE === 'scanning' ? true : PREVIEW_STATE === 'denied' ? false : null
  );
  const [scanned, setScanned]       = useState(false);

  useEffect(() => {
    if (visible && !PREVIEW_STATE) {
      setScanned(false);
      Camera.requestCameraPermissionsAsync().then(({ status }) => {
        setPermission(status === 'granted');
      });
    }
  }, [visible]);

  function handleBarcode({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    onScanned(data);
    onClose();
  }

  return (
    <RootModal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <View style={s.backdrop} />

      {/* Sheet */}
      <View style={s.sheet} pointerEvents="box-none">
        <View style={s.card}>

          {/* Header */}
          <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.sideBtn}>
              <Text style={[s.closeText, { fontFamily: af('medium') }]}>{t('close')}</Text>
            </TouchableOpacity>
            <Text style={[s.title, { fontFamily: af('semibold') }]}>{t('scanQR')}</Text>
            <TouchableOpacity
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
              activeOpacity={0.7}
              style={s.sideBtn}
            >
              <Text style={s.flipText}>⇄</Text>
            </TouchableOpacity>
          </View>

          {/* Camera */}
          <View style={s.cameraWrap}>
            {hasPermission === false ? (
              <View style={s.permDenied}>
                <Text style={s.permText}>Camera permission denied.</Text>
                <Text style={s.permSub}>Allow camera access in your device settings to scan QR codes.</Text>
              </View>
            ) : hasPermission === null ? (
              <View style={s.permDenied}>
                <Text style={s.permText}>Requesting camera permission…</Text>
              </View>
            ) : (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing={facing}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleBarcode}
              >
                {/* Scan target overlay */}
                <View style={s.overlay}>
                  <View style={s.scanFrame} />
                  <Text style={s.scanHint}>Point the camera at a QR code</Text>
                  <TouchableOpacity
                    style={s.manualBtn}
                    onPress={() => { onScanned(''); onClose(); }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.manualBtnText}>Enter Manually</Text>
                  </TouchableOpacity>
                </View>
              </CameraView>
            )}
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 660,
    height: 680,
    backgroundColor: Colors.black,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  sideBtn: {
    width: 80,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.red,
    letterSpacing: -0.3,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  flipText: {
    fontSize: 22,
    color: Colors.primary,
  },

  // Camera
  cameraWrap: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Permission denied
  permDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  permSub: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayText,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  // Scan overlay
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scanHint: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: -0.2,
  },
  manualBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  manualBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
