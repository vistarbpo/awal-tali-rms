import { StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export const SCREEN_PAD   = 20; // consistent padding on all sides
export const RIGHT_PAD    = SCREEN_PAD;
export const LEFT_PANEL_W = 350;
export const CARD_GAP     = 14;
export const IPAD_W       = 1180; // iPad Air / iPad 10th gen landscape logical width
export const IPAD_H       = 820;

export const layout = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  right: {
    flex: 1,
    padding: SCREEN_PAD,
  },

  /* ── Action bar ── */
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnDanger: {
    backgroundColor: Colors.red,
    shadowColor: Colors.redShadow,
  },
  actionIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  /* ── Search bar ── */
  searchBar: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    outlineWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBarFocused: {
    borderColor: Colors.primary,
    shadowOpacity: 0.10,
  },
  searchIconWrap: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    opacity: 0.35,
  },
  searchInputWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    padding: 0,
    height: 40,
    outlineWidth: 0,
    outlineStyle: 'none',
    boxShadow: 'none',
  } as any,

  /* ── Tab bar ── */
  tabBar: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 8,
    height: 64,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.grayText,
    letterSpacing: 0.4,
  },
  tabLabelActive: {
    color: Colors.primary,
  },

  /** Digits + SAR icon: keep LTR so the symbol stays after the amount in RTL screens. */
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    direction: 'ltr',
  },
});
