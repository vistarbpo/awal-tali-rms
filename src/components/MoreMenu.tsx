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
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useI18n } from '../i18n';
import LangToggle from './LangToggle';

// ─── Icons ────────────────────────────────────────────────────────────────────
import {
  iconKeyRound, iconCalendarArrowDown, iconInbox, iconCircleDollarSign,
  iconPackageCheck, iconChartColumnBig, iconRefreshCcw, iconWrench,
  iconCable, iconHeadset, iconLogOut, iconTags, iconTables,
} from '../assets/icons';


const ICONS: Record<string, ImageSourcePropType> = {
  keyRound:          iconKeyRound,
  calendarArrowDown: iconCalendarArrowDown,
  inbox:             iconInbox,
  circleDollarSign:  iconCircleDollarSign,
  packageCheck:      iconPackageCheck,
  chartColumnBig:    iconChartColumnBig,
  refreshCcw:        iconRefreshCcw,
  wrench:            iconWrench,
  cable:             iconCable,
  headset:           iconHeadset,
  logOut:            iconLogOut,
  tags:              iconTags,
  tables:            iconTables,
};

// ─── Menu items ───────────────────────────────────────────────────────────────
interface MenuItem {
  key: string;
  label: string;
  icon: ImageSourcePropType;
  danger?: boolean;
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
  const { t, af } = useI18n();
  const menuItems: MenuItem[] = [
    { key: isTillOpen ? 'close_till' : 'open_till',
      label: isTillOpen ? t('closeTill') : t('openTill'),
      icon: ICONS.keyRound },
    { key: 'end_of_day',   label: t('endOfDay'),          icon: ICONS.calendarArrowDown },
    { key: 'drawer',       label: t('drawerOps'),          icon: ICONS.inbox             },
    { key: 'house_acct',   label: t('houseAccountPay'),    icon: ICONS.circleDollarSign  },
    { key: 'availability', label: t('productAvail'),       icon: ICONS.packageCheck      },
    { key: 'reports',      label: t('reports'),            icon: ICONS.chartColumnBig    },
    { key: 'sync',         label: t('syncData'),           icon: ICONS.refreshCcw        },
    { key: 'diagnostics',  label: t('diagnostics'),        icon: ICONS.wrench            },
    { key: 'devices',      label: t('devices'),            icon: ICONS.cable             },
    { key: 'support',      label: t('support'),            icon: ICONS.headset           },
    { key: 'exit',         label: 'Exit',                  icon: ICONS.logOut, danger: true },
  ];
  const useModal  = Platform.OS !== 'web';

  const inner = (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>
      <View
        style={[s.menuAnchor, { left: leftPanelWidth, bottom: tabBarBottomOffset }]}
        pointerEvents="box-none"
      >
        <View style={s.card}>
          {/* Triangle — points down toward the HOME tab */}
          <View style={s.triangleWrap} pointerEvents="none">
            <View style={s.triangle} />
          </View>

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
                <Text style={[s.label, item.danger && s.labelDanger, { fontFamily: af('regular') }]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Language switcher */}
          <View style={s.divider} />
          <View style={s.langRow}>
            <LangToggle variant="dark" />
          </View>
        </View>
      </View>
    </>
  );

  if (useModal) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        {inner}
      </Modal>
    );
  }

  if (!visible) return null;
  return <View style={s.inlineOverlay} pointerEvents="box-none">{inner}</View>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const MENU_WIDTH = 340;

const s = StyleSheet.create({
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
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
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.grayText,
    letterSpacing: -0.4,
    flex: 1,
  },
  labelDanger: {
    color: Colors.red,
  },
  langRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  triangleWrap: {
    position: 'absolute',
    bottom: -12,
    left: 40,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
  },
});
