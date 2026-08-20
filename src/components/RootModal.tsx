import React from 'react';
import { Modal, View, StyleSheet, Platform } from 'react-native';

/**
 * On web, React Native's Modal portals to the document and covers the full viewport.
 * For the centered iPad preview frame, we render an in-tree overlay so backdrops and
 * dialogs align with the app container. Native keeps using Modal.
 */
type Props = {
  visible: boolean;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  statusBarTranslucent?: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
};

export default function RootModal({
  visible,
  transparent = true,
  animationType = 'fade',
  statusBarTranslucent = true,
  onRequestClose,
  children,
}: Props) {
  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <View style={styles.webOverlay} pointerEvents="box-none">
        {children}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={onRequestClose}
    >
      {children}
    </Modal>
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5000,
    elevation: 5000,
  },
});
