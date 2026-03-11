import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  ImageSourcePropType,
} from 'react-native';
import { Colors } from '../constants/colors';

// ─── Icons (Figma node 47-525) ────────────────────────────────────────────────
const ICONS: Record<string, ImageSourcePropType> = {
  keyRound:          { uri: 'https://www.figma.com/api/mcp/asset/d96a1bca-1eb3-459d-8260-6f22cb914ba8' },
  calendarArrowDown: { uri: 'https://www.figma.com/api/mcp/asset/90002dca-b188-4ddb-b36c-21eff183ccb1' },
  inbox:             { uri: 'https://www.figma.com/api/mcp/asset/0999b698-852a-493a-b36f-79b179ee074a' },
  circleDollarSign:  { uri: 'https://www.figma.com/api/mcp/asset/45ecc482-c854-4aa2-bc0d-fba12329c3f6' },
  packageCheck:      { uri: 'https://www.figma.com/api/mcp/asset/864b92c2-b5c7-4545-ac71-65adbdc8a852' },
  chartColumnBig:    { uri: 'https://www.figma.com/api/mcp/asset/6d3794fb-c767-4ef9-add2-529c9705e512' },
  refreshCcw:        { uri: 'https://www.figma.com/api/mcp/asset/f0b23d9b-db2b-42e8-8692-41fe1a792669' },
  wrench:            { uri: 'https://www.figma.com/api/mcp/asset/e3b32276-5c16-4ae4-8968-19f396e33f44' },
  cable:             { uri: 'https://www.figma.com/api/mcp/asset/72fb9dea-4ecf-44ca-9efd-1eb6f280278a' },
  headset:           { uri: 'https://www.figma.com/api/mcp/asset/7e94f338-770c-457d-ab25-8548a47e6ab6' },
  logOut:            { uri: 'https://www.figma.com/api/mcp/asset/06c15b47-6807-494f-86cd-c10b2629a779' },
  polygon:           { uri: 'https://www.figma.com/api/mcp/asset/d4f8a821-08e9-41a6-8000-1e8452036fc5' },
};

// ─── Menu items ───────────────────────────────────────────────────────────────
interface MenuItem {
  key: string;
  label: string;
  icon: ImageSourcePropType;
  danger?: boolean;
}

function buildMenuItems(isTillOpen: boolean): MenuItem[] {
  return [
    { key: isTillOpen ? 'close_till' : 'open_till',
      label: isTillOpen ? 'Close Till' : 'Open Till',
      icon: ICONS.keyRound },
    { key: 'end_of_day',   label: 'End of Day (30/06/2025)', icon: ICONS.calendarArrowDown },
    { key: 'drawer',       label: 'Drawer Operations',       icon: ICONS.inbox             },
    { key: 'house_acct',   label: 'House Account Payment',   icon: ICONS.circleDollarSign  },
    { key: 'availability', label: 'Product Availability',    icon: ICONS.packageCheck      },
    { key: 'reports',      label: 'Reports',                 icon: ICONS.chartColumnBig    },
    { key: 'sync',         label: 'Sync Data',               icon: ICONS.refreshCcw        },
    { key: 'diagnostics',  label: 'Diagnostics',             icon: ICONS.wrench            },
    { key: 'devices',      label: 'Devices',                 icon: ICONS.cable             },
    { key: 'support',      label: 'Support',                 icon: ICONS.headset           },
    { key: 'exit',         label: 'Exit',                    icon: ICONS.logOut, danger: true },
  ];
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  onItemPress?: (key: string) => void;
  isTillOpen?: boolean;
  leftPanelWidth?: number;
  tabBarBottomOffset?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MoreMenu({
  visible,
  onClose,
  onItemPress,
  isTillOpen = false,
  leftPanelWidth = 360,
  tabBarBottomOffset = 76,
}: Props) {
  const menuItems = buildMenuItems(isTillOpen);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Full-screen backdrop — tap anywhere to dismiss */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View
        style={[s.menuAnchor, { left: leftPanelWidth, bottom: tabBarBottomOffset }]}
        pointerEvents="box-none"
      >
        {/* White card */}
        <View style={s.card}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => {
                onItemPress?.(item.key);
                onClose();
              }}
              activeOpacity={0.7}
            >
              {index > 0 && <View style={s.divider} />}
              <View style={s.row}>
                <Image source={item.icon} style={s.icon} />
                <Text style={[s.label, item.danger && s.labelDanger]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Triangle — points down toward the HOME tab */}
        <View style={s.triangleWrap}>
          <Image source={ICONS.polygon} style={s.triangle} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const MENU_WIDTH = 340;

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menuAnchor: {
    position: 'absolute',
    width: MENU_WIDTH,
    alignItems: 'flex-start',
  },
  card: {
    width: MENU_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.29)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 20,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.4,
    flex: 1,
  },
  labelDanger: {
    color: Colors.red,
  },
  triangleWrap: {
    paddingLeft: 40,
    marginTop: 2,
  },
  triangle: {
    width: 22,
    height: 13,
    resizeMode: 'contain',
    transform: [{ rotate: '180deg' }],
  },
});
