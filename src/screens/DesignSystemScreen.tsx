import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import ConfirmDialog from '../components/ConfirmDialog';
import VoidReasonDialog from '../components/VoidReasonDialog';
import OrderTypeDialog from '../components/OrderTypeDialog';
import TillAmountDialog from '../components/TillAmountDialog';

// ─── Nav chapters ─────────────────────────────────────────────────────────────
const CHAPTERS = [
  { key: 'brand',      label: 'Brand' },
  { key: 'colors',     label: 'Colors' },
  { key: 'typography', label: 'Typography' },
  { key: 'spacing',    label: 'Spacing' },
  { key: 'radius',     label: 'Radius' },
  { key: 'shadows',    label: 'Shadows' },
  { key: 'dividers',   label: 'Dividers' },
  { key: 'buttons',    label: 'Buttons' },
  { key: 'inputs',     label: 'Inputs' },
  { key: 'tabbar',     label: 'Tab Bar' },
  { key: 'orderitem',  label: 'Order Item' },
  { key: 'orderpanel', label: 'Order Panel' },
  { key: 'dialogs',    label: 'Dialogs' },
  { key: 'cards',      label: 'Card Anatomy' },
  { key: 'status',     label: 'Status' },
  { key: 'glass',      label: 'Glassmorphism' },
  { key: 'icons',      label: 'Icon Sizes' },
  { key: 'motion',     label: 'Motion' },
  { key: 'layout',     label: 'Layout' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Chip({ label, color = Colors.grayLight, textColor = Colors.grayText }: { label: string; color?: string; textColor?: string }) {
  return (
    <View style={[h.chip, { backgroundColor: color }]}>
      <Text style={[h.chipText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function Token({ k, v }: { k: string; v: string }) {
  return (
    <View style={h.token}>
      <Text style={h.tokenKey}>{k}</Text>
      <Text style={h.tokenVal}>{v}</Text>
    </View>
  );
}

function SectionHead({ id, title, sub }: { id?: string; title: string; sub?: string }) {
  return (
    <View style={h.sHead} nativeID={id}>
      <Text style={h.sHeadTitle}>{title}</Text>
      {sub && <Text style={h.sHeadSub}>{sub}</Text>}
    </View>
  );
}

function SubHead({ label }: { label: string }) {
  return <Text style={h.subHead}>{label}</Text>;
}

function Row({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) {
  return <View style={[h.row, { gap }]}>{children}</View>;
}

function BlinkingCursor() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.delay(400),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return <Animated.View style={[h.cursor, { opacity }]} />;
}

function FormRowPreview({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
  return (
    <View style={h.formRowPreview}>
      <Text style={h.formRowLabel}>{label}</Text>
      <View style={h.formRowInputBox}>
        <TextInput
          style={h.formRowInput}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          editable={true}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props { onClose?: () => void }

export default function DesignSystemScreen({ onClose }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeChapter, setActiveChapter] = useState('brand');
  const [confirmVisible, setConfirmVisible]     = useState(false);
  const [voidVisible, setVoidVisible]           = useState(false);
  const [orderTypeVisible, setOrderTypeVisible] = useState(false);
  const [tillVisible, setTillVisible]           = useState(false);
  const [searchFocused, setSearchFocused]       = useState(false);
  const [activeTab, setActiveTab]               = useState('home');

  const sectionRefs = useRef<Record<string, number>>({});

  function scrollTo(key: string) {
    setActiveChapter(key);
    const y = sectionRefs.current[key];
    if (y !== undefined) scrollRef.current?.scrollTo({ y, animated: true });
  }

  function measureSection(key: string, y: number) {
    sectionRefs.current[key] = y;
  }

  return (
    <SafeAreaView style={s.safe}>

      {/* ══ TOP HEADER ══ */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerBadge}><Text style={s.headerBadgeText}>DS</Text></View>
          <View>
            <Text style={s.headerTitle}>Design System</Text>
            <Text style={s.headerSub}>Awal Tali RMS  ·  v1.0  ·  React Native + Expo</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.closeBtnText}>✕  Close</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.body}>

        {/* ══ LEFT SIDEBAR NAV ══ */}
        <ScrollView style={s.sidebar} showsVerticalScrollIndicator={false} contentContainerStyle={s.sidebarContent}>
          <Text style={s.sidebarLabel}>CHAPTERS</Text>
          {CHAPTERS.map(ch => (
            <TouchableOpacity
              key={ch.key}
              style={[s.navItem, activeChapter === ch.key && s.navItemActive]}
              onPress={() => scrollTo(ch.key)}
              activeOpacity={0.7}
            >
              <Text style={[s.navLabel, activeChapter === ch.key && s.navLabelActive]}>{ch.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ══ MAIN CONTENT ══ */}
        <ScrollView
          ref={scrollRef}
          style={s.content}
          contentContainerStyle={s.contentInner}
          showsVerticalScrollIndicator={false}
        >

          {/* ─── BRAND ─── */}
          <View onLayout={e => measureSection('brand', e.nativeEvent.layout.y)}>
            <SectionHead id="brand" title="Brand Identity" sub="Core brand values and visual language" />
            <View style={s.brandHero}>
              <View style={s.brandHeroLeft}>
                <Text style={s.brandName}>AWAL TALI</Text>
                <Text style={s.brandTagline}>Restaurant Management System</Text>
                <Text style={s.brandDesc}>
                  A cashier-first POS designed for iPad landscape. Tablet-optimised, touch-friendly, and built entirely from React Native primitives.
                </Text>
                <Row>
                  <Chip label="React Native 0.83" color={Colors.primaryLight} textColor={Colors.primary} />
                  <Chip label="Expo 55" color={Colors.primaryLight} textColor={Colors.primary} />
                  <Chip label="TypeScript" color={Colors.primaryLight} textColor={Colors.primary} />
                  <Chip label="iPad First" color={Colors.primaryLight} textColor={Colors.primary} />
                </Row>
              </View>
              <View style={s.brandPaletteMini}>
                {[Colors.primary, Colors.red, Colors.green, Colors.goldShade, Colors.yellowGold, Colors.black].map(c => (
                  <View key={c} style={[s.brandPaletteDot, { backgroundColor: c }]} />
                ))}
              </View>
            </View>

            <SubHead label="Design Principles" />
            <Row>
              {[
                { title: 'Touch First', desc: 'All interactive targets ≥ 44pt. Generous padding. No hover-only states.' },
                { title: 'Brand Consistent', desc: 'Every color, shadow, and radius comes from the token system — never hardcoded.' },
                { title: 'Fast & Clear', desc: 'Cashier app: every action reachable in ≤ 2 taps. Clear visual hierarchy.' },
                { title: 'Primitive Only', desc: 'Zero third-party UI libs. Built from View, Text, TouchableOpacity, Image.' },
              ].map(p => (
                <View key={p.title} style={s.principleCard}>
                  <Text style={s.principleTitle}>{p.title}</Text>
                  <Text style={s.principleDesc}>{p.desc}</Text>
                </View>
              ))}
            </Row>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── COLORS ─── */}
          <View onLayout={e => measureSection('colors', e.nativeEvent.layout.y)}>
            <SectionHead title="Color Palette" sub="All brand tokens — import from Colors in src/constants/colors.ts" />

            <SubHead label="Brand Core" />
            <View style={s.swatchGrid}>
              {[
                { token: 'primary',     hex: Colors.primary,     label: 'Buttons · headers · primary text' },
                { token: 'black',       hex: Colors.black,       label: 'Body text · high-contrast' },
                { token: 'white',       hex: Colors.white,       label: 'Card backgrounds · surfaces' },
                { token: 'red',         hex: Colors.red,         label: 'Void · danger · destructive actions' },
                { token: 'green',       hex: Colors.green,       label: 'Success · clocked-in indicator' },
                { token: 'goldShade',   hex: Colors.goldShade,   label: 'Gold accents · decorative' },
                { token: 'yellowGold',  hex: Colors.yellowGold,  label: 'Add Customer link text' },
                { token: 'brandYellow', hex: Colors.brandYellow, label: 'Brand yellow tint' },
              ].map(sw => <ColorSwatch key={sw.token} {...sw} />)}
            </View>

            <SubHead label="Semantic / UI" />
            <View style={s.swatchGrid}>
              {[
                { token: 'background',    hex: Colors.background,    label: 'Screen background' },
                { token: 'backgroundAlt', hex: Colors.backgroundAlt, label: 'Panel / sidebar bg' },
                { token: 'primaryLight',  hex: Colors.primaryLight,  label: 'Selected item tint' },
                { token: 'primaryHover',  hex: Colors.primaryHover,  label: 'Primary pressed state' },
                { token: 'liteColor',     hex: Colors.liteColor,     label: 'Subtle warm tint' },
                { token: 'liteColor2',    hex: Colors.liteColor2,    label: 'Voided order item bg' },
              ].map(sw => <ColorSwatch key={sw.token} {...sw} />)}
            </View>

            <SubHead label="Text & Borders" />
            <View style={s.swatchGrid}>
              {[
                { token: 'grayText',    hex: Colors.grayText,    label: 'Secondary labels · subtitles' },
                { token: 'grayMid',     hex: Colors.grayMid,     label: 'Disabled text · nav labels' },
                { token: 'grayLight',   hex: Colors.grayLight,   label: 'Dialog header band · strips' },
                { token: 'grayBorder',  hex: Colors.grayBorder,  label: 'Dividers · input borders' },
                { token: 'placeholder', hex: Colors.placeholder,  label: 'Input placeholder text' },
              ].map(sw => <ColorSwatch key={sw.token} {...sw} />)}
            </View>

            <SubHead label="Shadows" />
            <View style={s.swatchGrid}>
              {[
                { token: 'shadow',    hex: Colors.shadow,    label: 'Primary button shadow' },
                { token: 'redShadow', hex: Colors.redShadow, label: 'Danger button shadow' },
              ].map(sw => <ColorSwatch key={sw.token} {...sw} />)}
            </View>

            <SubHead label="Color Usage Guide" />
            <View style={s.usageGrid}>
              {[
                { bg: Colors.primary, fg: Colors.white,    label: 'Primary on White',    pass: 'AAA' },
                { bg: Colors.white,   fg: Colors.primary,  label: 'White on Primary',    pass: 'AAA' },
                { bg: Colors.red,     fg: Colors.white,    label: 'Danger on White',     pass: 'AA' },
                { bg: Colors.black,   fg: Colors.white,    label: 'Black Text on White', pass: 'AAA' },
                { bg: Colors.grayLight, fg: Colors.primary,label: 'Primary on GrayLight',pass: 'AA' },
                { bg: Colors.primary, fg: Colors.goldShade, label: 'Gold on Primary',    pass: '—' },
              ].map(u => (
                <View key={u.label} style={[s.usageCard, { backgroundColor: u.bg }]}>
                  <Text style={[s.usageLabel, { color: u.fg }]}>{u.label}</Text>
                  <View style={[s.usageBadge, { backgroundColor: u.fg + '22' }]}>
                    <Text style={[s.usageBadgeText, { color: u.fg }]}>WCAG {u.pass}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── TYPOGRAPHY ─── */}
          <View onLayout={e => measureSection('typography', e.nativeEvent.layout.y)}>
            <SectionHead title="Typography" sub="System font (SF Pro on iOS). All weights from 400–700." />

            <SubHead label="Type Scale" />
            <View style={s.typeTable}>
              {[
                { role: 'Display',         size: 42, weight: '700', color: Colors.primary,   ls: -1.5,   sample: 'AWAL TALI' },
                { role: 'Heading 1',       size: 28, weight: '700', color: Colors.primary,   ls: -0.7,   sample: 'Welcome back!' },
                { role: 'Heading 2',       size: 22, weight: '700', color: Colors.primary,   ls: -0.5,   sample: 'Design System' },
                { role: 'Dialog Title',    size: 20, weight: '600', color: Colors.primary,   ls: -0.4,   sample: 'Cancel Order' },
                { role: 'Order Total',     size: 23, weight: '600', color: Colors.white,     ls: -0.115, sample: '240.00', bg: Colors.primary },
                { role: 'Section Header',  size: 15, weight: '600', color: Colors.primary,   ls: 0,      sample: 'Section Header' },
                { role: 'List Row',        size: 18, weight: '500', color: Colors.primary,   ls: -0.35,  sample: 'Customer cancelled' },
                { role: 'Body / Item',     size: 14, weight: '400', color: Colors.black,     ls: -0.07,  sample: 'Grilled Chicken with sides' },
                { role: 'Item Price',      size: 18, weight: '600', color: Colors.black,     ls: -0.09,  sample: '45.00' },
                { role: 'Dialog Subtitle', size: 13, weight: '400', color: Colors.grayText,  ls: -0.1,   sample: 'Select a reason to void this order' },
                { role: 'Tab Label',       size: 13, weight: '700', color: Colors.grayText,  ls: 0.4,    sample: 'ORDERS' },
                { role: 'Tab Active',      size: 13, weight: '700', color: Colors.primary,   ls: 0.4,    sample: 'HOME' },
                { role: 'Action Label',    size: 12, weight: '500', color: Colors.white,     ls: 0.2,    sample: 'Kitchen', bg: Colors.primary },
                { role: 'Caption',         size: 11, weight: '400', color: Colors.grayText,  ls: 0,      sample: 'Secondary information text' },
                { role: 'Overline',        size: 11, weight: '700', color: Colors.grayText,  ls: 1.2,    sample: 'SECTION LABEL' },
              ].map(t => (
                <View key={t.role} style={s.typeRow}>
                  <View style={s.typeRoleCol}>
                    <Text style={s.typeRole}>{t.role}</Text>
                    <Text style={s.typeMeta}>{t.size}px · {t.weight} · ls {t.ls}</Text>
                  </View>
                  <View style={[s.typeSampleCol, t.bg ? { backgroundColor: t.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 } : null]}>
                    <Text style={{ fontSize: t.size, fontWeight: t.weight as any, color: t.color, letterSpacing: t.ls }} numberOfLines={1}>
                      {t.sample}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <SubHead label="Font Weights" />
            <Row>
              {(['400', '500', '600', '700'] as const).map(w => (
                <View key={w} style={s.weightCard}>
                  <Text style={[s.weightSample, { fontWeight: w }]}>Aa</Text>
                  <Text style={s.weightLabel}>weight {w}</Text>
                  <Text style={s.weightUsage}>
                    {w === '400' ? 'Body, descriptions' : w === '500' ? 'List rows, labels' : w === '600' ? 'Titles, prices' : 'Buttons, totals'}
                  </Text>
                </View>
              ))}
            </Row>

            <SubHead label="Letter Spacing" />
            <Row>
              {([-1.5, -0.5, -0.2, 0, 0.4, 1.2] as number[]).map(ls => (
                <View key={ls} style={s.lsCard}>
                  <Text style={[s.lsSample, { letterSpacing: ls }]}>Sphinx</Text>
                  <Text style={s.lsLabel}>{ls > 0 ? '+' : ''}{ls}</Text>
                </View>
              ))}
            </Row>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── SPACING ─── */}
          <View onLayout={e => measureSection('spacing', e.nativeEvent.layout.y)}>
            <SectionHead title="Spacing System" sub="Base unit: 4px. All spacing is a multiple of 4." />
            <View style={s.spacingTable}>
              {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72].map(v => (
                <View key={v} style={s.spacingRow}>
                  <Text style={s.spacingValue}>{v}px</Text>
                  <View style={s.spacingTrack}>
                    <View style={[s.spacingFill, { width: Math.min(v * 3, 280) }]} />
                  </View>
                  <Text style={s.spacingNote}>
                    {v === 4  ? 'xs — icon gap' :
                     v === 8  ? 'sm — tight gap' :
                     v === 12 ? 'Search bar mb' :
                     v === 14 ? 'card gap (CARD_GAP)' :
                     v === 16 ? 'dialog padding' :
                     v === 18 ? 'panel header pad' :
                     v === 20 ? 'screen pad (SCREEN_PAD)' :
                     v === 24 ? 'row pad horizontal' :
                     v === 26 ? 'dialog row pad' :
                     v === 32 ? 'login brand pad' :
                     v === 40 ? 'login brand top' :
                     v === 48 ? '2xl — welcome header' :
                     v === 56 ? 'CTA button height' :
                     v === 72 ? 'dialog header height' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── BORDER RADIUS ─── */}
          <View onLayout={e => measureSection('radius', e.nativeEvent.layout.y)}>
            <SectionHead title="Border Radius" sub="Consistent corner rounding across all surfaces." />
            <Row gap={20}>
              {[
                { r: 4,  label: 'r-4',  usage: 'Tags, tiny badges' },
                { r: 6,  label: 'r-6',  usage: 'Small chips' },
                { r: 8,  label: 'r-8',  usage: 'Spec tokens' },
                { r: 10, label: 'r-10', usage: 'Nav items, pills' },
                { r: 14, label: 'r-14', usage: 'Action btns, cards, tab bar' },
                { r: 16, label: 'r-16', usage: 'Order panel card' },
                { r: 24, label: 'r-24', usage: 'Dialog / modal card' },
                { r: 26, label: 'r-26', usage: 'Icon circle (void)' },
              ].map(({ r, label, usage }) => (
                <View key={r} style={s.radiusItem}>
                  <View style={[s.radiusBox, { borderRadius: r, width: r * 2.5 + 28, height: r * 2.5 + 28 }]} />
                  <Text style={s.radiusVal}>{label}</Text>
                  <Text style={s.radiusUsage}>{usage}</Text>
                </View>
              ))}
            </Row>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── SHADOWS ─── */}
          <View onLayout={e => measureSection('shadows', e.nativeEvent.layout.y)}>
            <SectionHead title="Shadows" sub="All shadows use brand color values, not generic black." />
            <Row gap={20}>
              {[
                {
                  label: 'Primary Button',
                  style: { shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
                  bg: Colors.primary,
                  desc: 'shadowColor: shadow · offset: 0,4 · opacity: 1 · radius: 6',
                },
                {
                  label: 'Danger Button',
                  style: { shadowColor: Colors.redShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
                  bg: Colors.red,
                  desc: 'shadowColor: redShadow · offset: 0,4 · opacity: 1 · radius: 6',
                },
                {
                  label: 'Dialog Card',
                  style: { shadowColor: Colors.black, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 28, elevation: 14 },
                  bg: Colors.white,
                  desc: 'shadowColor: black · offset: 0,10 · opacity: 0.22 · radius: 28',
                },
                {
                  label: 'Order Card',
                  style: { shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
                  bg: Colors.white,
                  desc: 'shadowColor: black · offset: 0,0 · opacity: 0.07 · radius: 12',
                },
                {
                  label: 'Search Bar',
                  style: { shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
                  bg: Colors.white,
                  desc: 'shadowColor: black · offset: 0,2 · opacity: 0.06 · radius: 8',
                },
                {
                  label: 'Login Panel',
                  style: { shadowColor: Colors.black, shadowOffset: { width: 8, height: 0 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 10 },
                  bg: Colors.white,
                  desc: 'shadowColor: black · offset: 8,0 · opacity: 0.18 · radius: 24',
                },
              ].map(sh => (
                <View key={sh.label} style={s.shadowCard}>
                  <View style={[s.shadowBox, sh.style, { backgroundColor: sh.bg }]}>
                    {sh.bg === Colors.white && <Text style={s.shadowBoxLabel}>{sh.label}</Text>}
                  </View>
                  <Text style={s.shadowLabel}>{sh.label}</Text>
                  <Text style={s.shadowDesc}>{sh.desc}</Text>
                </View>
              ))}
            </Row>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── DIVIDERS ─── */}
          <View onLayout={e => measureSection('dividers', e.nativeEvent.layout.y)}>
            <SectionHead title="Dividers" sub="Three divider variants used across the app." />
            <View style={s.dividerShowcase}>
              {[
                { label: 'Full divider (1px, grayBorder)',     el: <View style={{ height: 1, backgroundColor: Colors.grayBorder, flex: 1 }} /> },
                { label: 'Inset divider (0.5px, rgba 18%)',    el: <View style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.18)', flex: 1 }} /> },
                { label: 'Dialog inset (0.5px, rgba 29%)',     el: <View style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.29)', marginLeft: 24, flex: 1 }} /> },
                { label: 'Section separator (1px, grayBorder with opacity)',  el: <View style={{ height: 1, backgroundColor: Colors.grayBorder, flex: 1, opacity: 0.6 }} /> },
                { label: 'Accent bar (4px, Colors.red)',        el: <View style={{ height: 4, backgroundColor: Colors.red, flex: 1 }} /> },
                { label: 'Selected bar (5px, Colors.primary)',  el: <View style={{ height: 5, backgroundColor: Colors.primary, flex: 1 }} /> },
              ].map(d => (
                <View key={d.label} style={s.dividerRow}>
                  <Text style={s.dividerLabel}>{d.label}</Text>
                  <View style={s.dividerLine}>{d.el}</View>
                </View>
              ))}
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── BUTTONS ─── */}
          <View onLayout={e => measureSection('buttons', e.nativeEvent.layout.y)}>
            <SectionHead title="Buttons" sub="All interactive states. height: 56, borderRadius: 14." />

            <SubHead label="CTA Buttons" />
            <Row>
              <View style={[s.ctaBtn, { backgroundColor: Colors.primary, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 }]}>
                <Text style={s.ctaBtnText}>Primary Action</Text>
              </View>
              <View style={[s.ctaBtn, { backgroundColor: Colors.red, shadowColor: Colors.redShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 }]}>
                <Text style={s.ctaBtnText}>Danger Action</Text>
              </View>
              <View style={[s.ctaBtn, { backgroundColor: Colors.grayLight }]}>
                <Text style={[s.ctaBtnText, { color: Colors.grayText }]}>Ghost / Cancel</Text>
              </View>
              <View style={[s.ctaBtn, { backgroundColor: Colors.grayBorder, opacity: 0.5 }]}>
                <Text style={[s.ctaBtnText, { color: Colors.grayMid }]}>Disabled</Text>
              </View>
            </Row>

            <SubHead label="Action Bar Buttons" />
            <View style={s.actionBarRow}>
              {[
                { label: 'Print',    danger: false },
                { label: 'Kitchen', danger: false },
                { label: 'Void',    danger: true  },
                { label: 'Discount',danger: false },
                { label: 'Notes',   danger: false },
                { label: 'Tags',    danger: false },
                { label: 'More',    danger: false },
              ].map(b => (
                <View key={b.label} style={[s.actionBtn, b.danger && s.actionBtnDanger]}>
                  <View style={s.actionIconBox} />
                  <Text style={s.actionBtnLabel}>{b.label}</Text>
                </View>
              ))}
            </View>
            <View style={s.actionSpecGrid}>
              <Token k="height (icon)" v="36×36" />
              <Token k="padding H" v="12px" />
              <Token k="padding V" v="14px" />
              <Token k="borderRadius" v="14" />
              <Token k="gap" v="8px" />
              <Token k="fontSize" v="12px · 500" />
            </View>

            <SubHead label="Icon-only / Small Buttons" />
            <Row>
              {[Colors.primary, Colors.red, Colors.grayLight].map((bg, i) => (
                <View key={bg} style={[s.iconBtn, { backgroundColor: bg }]}>
                  <View style={[s.iconBtnDot, { backgroundColor: i === 2 ? Colors.grayText : Colors.white }]} />
                </View>
              ))}
              <View style={[s.iconBtn, { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.grayBorder }]}>
                <View style={[s.iconBtnDot, { backgroundColor: Colors.primary }]} />
              </View>
            </Row>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── INPUTS ─── */}
          <View onLayout={e => measureSection('inputs', e.nativeEvent.layout.y)}>
            <SectionHead title="Inputs" sub="Search bar, form rows, and keypad. All inputs are touch-optimised for iPad (min-height 56–68px)." />

            {/* ── Search Bar ── */}
            <SubHead label="Search Bar — Default" />
            <View style={s.searchBar}>
              <View style={s.searchIconWrap}>
                <View style={s.searchIconDot} />
              </View>
              <Text style={s.searchPlaceholder}>Search Products</Text>
            </View>

            <SubHead label="Search Bar — Focused" />
            <View style={[s.searchBar, s.searchBarFocused]}>
              <View style={s.searchIconWrap}>
                <View style={[s.searchIconDot, { opacity: 0.8 }]} />
              </View>
              <Text style={[s.searchPlaceholder, { color: Colors.black }]}>Chicken</Text>
              <View style={s.searchCursor} />
            </View>

            <View style={s.actionSpecGrid}>
              <Token k="height" v="60px" />
              <Token k="borderRadius" v="16" />
              <Token k="borderWidth" v="1.5px" />
              <Token k="border default" v="transparent" />
              <Token k="border focused" v="Colors.primary" />
              <Token k="icon size" v="22×22 · opacity 0.35" />
              <Token k="fontSize" v="16px · 400" />
              <Token k="placeholderColor" v="Colors.placeholder" />
            </View>

            {/* ── Dialog Search Bar ── */}
            <SubHead label="Dialog Search Bar" />
            <View style={s.dialogSearchBox}>
              <Image source={require('../assets/icons/search.png')} style={s.dsSearchIcon} />
              <Text style={s.dsSearchPlaceholder}>Search by name or phone</Text>
            </View>
            <View style={s.actionSpecGrid}>
              <Token k="height" v="56px" />
              <Token k="borderRadius" v="12" />
              <Token k="bg" v="Colors.grayLight" />
              <Token k="border" v="1px Colors.grayBorder" />
              <Token k="paddingH" v="14px" />
              <Token k="fontSize" v="16px · 400" />
            </View>

            {/* ── Form Row ── */}
            <SubHead label="Form Row — Default (label + inline input)" />
            <View style={s.formCard}>
              <FormRowPreview label="Country" value="" placeholder="Saudi Arabia" />
              <View style={s.formRowDivider} />
              <FormRowPreview label="Name" value="" placeholder="Full name" />
              <View style={s.formRowDivider} />
              <FormRowPreview label="Phone" value="" placeholder="+966 5x xxx xxxx" />
              <View style={s.formRowDivider} />
              <FormRowPreview label="Email" value="" placeholder="email@example.com" />
            </View>

            <SubHead label="Form Row — Filled" />
            <View style={s.formCard}>
              <FormRowPreview label="Country" value="Saudi Arabia" placeholder="" />
              <View style={s.formRowDivider} />
              <FormRowPreview label="Name" value="Ahmed Al-Rashidi" placeholder="" />
              <View style={s.formRowDivider} />
              <FormRowPreview label="Phone" value="+966 50 123 4567" placeholder="" />
              <View style={s.formRowDivider} />
              <FormRowPreview label="Email" value="ahmed@example.com" placeholder="" />
            </View>

            <SubHead label="Form Row — Address Form" />
            <View style={s.formCard}>
              <FormRowPreview label="Address" value="" placeholder="Street, building" />
              <View style={s.formRowDivider} />
              <FormRowPreview label="Description" value="" placeholder="Floor, apt, landmark" />
              <View style={s.formRowDivider} />
              <FormRowPreview label="Delivery zone" value="" placeholder="Zone A" />
            </View>

            {/* ── States ── */}
            <SubHead label="Form Row States" />
            <View style={s.formStateRow}>

              {/* Default */}
              <View style={s.formStateItem}>
                <View style={s.formStateRow2}>
                  <Text style={s.formStateLabel}>Name</Text>
                  <View style={[s.formStateBox, s.formStateBoxDefault]}>
                    <Text style={s.formStatePlaceholder}>Full name</Text>
                  </View>
                </View>
                <Text style={s.formStateCaption}>Empty / Default</Text>
              </View>

              {/* Focused */}
              <View style={s.formStateItem}>
                <View style={s.formStateRow2}>
                  <Text style={[s.formStateLabel, s.formStateLabelFocused]}>Name</Text>
                  <View style={[s.formStateBox, s.formStateBoxFocused]}>
                    <View style={s.formStateFocusedRight}>
                      <Text style={s.formStateValue}>Ahmed</Text>
                      <BlinkingCursor />
                    </View>
                  </View>
                </View>
                <Text style={s.formStateCaption}>Focused</Text>
              </View>

              {/* Filled */}
              <View style={s.formStateItem}>
                <View style={s.formStateRow2}>
                  <Text style={s.formStateLabel}>Name</Text>
                  <View style={[s.formStateBox, s.formStateBoxDefault]}>
                    <Text style={s.formStateValue}>Ahmed Al-Rashidi</Text>
                  </View>
                </View>
                <Text style={s.formStateCaption}>Filled</Text>
              </View>

              {/* Disabled */}
              <View style={s.formStateItem}>
                <View style={[s.formStateRow2, { opacity: 0.5 }]}>
                  <Text style={[s.formStateLabel, { color: Colors.grayMid }]}>Name</Text>
                  <View style={[s.formStateBox, s.formStateBoxDisabled]}>
                    <Text style={[s.formStateValue, { color: Colors.grayMid }]}>Locked</Text>
                  </View>
                </View>
                <Text style={s.formStateCaption}>Disabled</Text>
              </View>

            </View>

            <View style={s.actionSpecGrid}>
              <Token k="row minHeight" v="68px" />
              <Token k="row paddingH" v="20px" />
              <Token k="label fontSize" v="16px · 500 · Colors.black" />
              <Token k="label (focused)" v="16px · 600 · Colors.primary" />
              <Token k="input box height" v="44px" />
              <Token k="input box radius" v="10" />
              <Token k="input box default" v="Colors.grayLight bg · transparent border" />
              <Token k="input box focused" v="white bg · 1.5px Colors.primary border · glow" />
              <Token k="input fontSize" v="15px · 400 · Colors.primary · right" />
              <Token k="divider" v="0.5px · rgba(60,60,67,0.29) · marginLeft 20" />
              <Token k="card radius" v="14" />
            </View>

            {/* ── PIN Keypad ── */}
            <SubHead label="PIN Keypad Key" />
            <Row>
              {['1','2','3'].map(k => (
                <View key={k} style={s.pinKey}>
                  <Text style={s.pinKeyText}>{k}</Text>
                </View>
              ))}
              <View style={[s.pinKey, s.pinKeyDelete]}>
                <Text style={[s.pinKeyText, { color: Colors.red }]}>⌫</Text>
              </View>
            </Row>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── TAB BAR ─── */}
          <View onLayout={e => measureSection('tabbar', e.nativeEvent.layout.y)}>
            <SectionHead title="Tab Bar" sub="Bottom navigation. height: 64. Icons 22×22." />
            <View style={s.tabBar}>
              {['HOME', 'ORDERS', 'TABLES', 'NEW'].map((label, i) => (
                <TouchableOpacity
                  key={label}
                  style={[s.tabItem, activeTab === label.toLowerCase() && s.tabItemActive]}
                  onPress={() => setActiveTab(label.toLowerCase())}
                  activeOpacity={0.7}
                >
                  <View style={[s.tabIconBox, activeTab === label.toLowerCase() && { opacity: 1 }]} />
                  <Text style={[s.tabLabel, activeTab === label.toLowerCase() && s.tabLabelActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.actionSpecGrid}>
              <Token k="height" v="64px" />
              <Token k="borderRadius" v="14" />
              <Token k="active bg" v="primaryLight" />
              <Token k="icon inactive" v="opacity 0.45" />
              <Token k="icon active" v="opacity 1" />
              <Token k="label size" v="13px · 700 · ls +0.4" />
              <Token k="gap (icon→label)" v="9px" />
              <Token k="padding H" v="14px" />
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── ORDER ITEM ─── */}
          <View onLayout={e => measureSection('orderitem', e.nativeEvent.layout.y)}>
            <SectionHead title="Order Item Row" sub="Individual cart line item. Three states." />

            <SubHead label="Default" />
            <OrderItemRow label="Grilled Chicken" qty={2} price="90.00" state="default" />

            <SubHead label="Selected" />
            <OrderItemRow label="Beef Steak" qty={1} price="65.00" state="selected" />

            <SubHead label="Voided" />
            <OrderItemRow label="Caesar Salad" qty={3} price="66.00" state="voided" />

            <View style={s.actionSpecGrid}>
              <Token k="padding H" v="18px" />
              <Token k="padding V" v="14px" />
              <Token k="qty fontSize" v="19px · 400" />
              <Token k="name fontSize" v="14px · 400" />
              <Token k="price fontSize" v="18px · 600" />
              <Token k="selected bar" v="5px · primary" />
              <Token k="selected bg" v="primaryLight" />
              <Token k="voided bg" v="liteColor2" />
              <Token k="x icon" v="16×16 · opacity 0.4" />
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── ORDER PANEL ─── */}
          <View onLayout={e => measureSection('orderpanel', e.nativeEvent.layout.y)}>
            <SectionHead title="Order Panel" sub="Left sidebar cart. width: 350. Full height." />
            <View style={s.panelPreview}>
              {/* Header */}
              <View style={s.panelHeader}>
                <View style={s.panelHeaderRow}>
                  <Text style={s.panelOrderType}>DINE IN</Text>
                  <Text style={s.panelAddCustomer}>ADD CUSTOMER</Text>
                </View>
                <View style={s.panelHeaderRow}>
                  <Text style={s.panelCount}>3</Text>
                  <Text style={s.panelActive}>ACTIVE</Text>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: Colors.grayBorder }} />
              {/* Items */}
              <OrderItemRow label="Fried Rice" qty={1} price="25.00" state="selected" />
              <OrderItemRow label="Garden Salad" qty={2} price="36.00" state="default" />
              <OrderItemRow label="Mango Juice" qty={1} price="15.00" state="default" />
              {/* Add Course */}
              <View style={s.addCourse}>
                <Text style={s.addCourseText}>Add Course</Text>
              </View>
              {/* Taxes */}
              <View style={s.taxesRow}>
                <Text style={s.taxesLabel}>Taxes</Text>
                <Text style={s.taxesVal}>SAR 11.40</Text>
              </View>
              {/* Total */}
              <View style={s.totalBtn}>
                <Text style={s.totalLabel}>TOTAL  ›</Text>
                <Text style={s.totalAmount}>SAR 87.40</Text>
              </View>
            </View>
            <View style={s.actionSpecGrid}>
              <Token k="panel width" v="350px" />
              <Token k="card borderRadius" v="16" />
              <Token k="header pad H" v="18px" />
              <Token k="total bg" v="Colors.primary" />
              <Token k="total font" v="23px · 600" />
              <Token k="tax bg" v="grayLight" />
              <Token k="addCourse bg" v="grayLight" />
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── DIALOGS ─── */}
          <View onLayout={e => measureSection('dialogs', e.nativeEvent.layout.y)}>
            <SectionHead title="Dialogs & Modals" sub="Live previews — tap to open. All follow the branded dialog pattern." />
            <Row gap={16}>
              {[
                { label: 'Confirm Dialog',     sub: 'Yes / No decision',       variant: 'primary', onPress: () => setConfirmVisible(true) },
                { label: 'Void Reason Dialog', sub: 'Destructive · red accent', variant: 'danger',  onPress: () => setVoidVisible(true) },
                { label: 'Order Type Dialog',  sub: 'Dine In / Delivery etc',  variant: 'primary', onPress: () => setOrderTypeVisible(true) },
                { label: 'Till Amount Dialog', sub: 'Numpad entry',             variant: 'primary', onPress: () => setTillVisible(true) },
              ].map(d => (
                <TouchableOpacity key={d.label} style={s.dialogTile} onPress={d.onPress} activeOpacity={0.8}>
                  <View style={[s.dialogTileAccent, d.variant === 'danger' && { backgroundColor: Colors.red }]} />
                  <View style={s.dialogTileBody}>
                    <Text style={s.dialogTileLabel}>{d.label}</Text>
                    <Text style={s.dialogTileSub}>{d.sub}</Text>
                    <View style={[s.dialogTileBtn, d.variant === 'danger' && { backgroundColor: Colors.red }]}>
                      <Text style={s.dialogTileBtnText}>Open Modal →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Row>

            <SubHead label="Dialog Backdrop" />
            <View style={s.backdropDemo}>
              <View style={s.backdropDemoInner}>
                <Text style={s.backdropDemoText}>rgba(0, 0, 0, 0.45)</Text>
                <Text style={s.backdropDemoSub}>Modal backdrop overlay</Text>
              </View>
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── CARD ANATOMY ─── */}
          <View onLayout={e => measureSection('cards', e.nativeEvent.layout.y)}>
            <SectionHead title="Card Anatomy" sub="Two card variants: Standard (primary header) and Danger (red accent bar)." />

            <SubHead label="Standard Dialog Card" />
            <View style={s.cardShowcaseRow}>
              <View style={s.card}>
                <View style={s.cardHeaderBand}>
                  <Text style={s.cardTitle}>Order Type</Text>
                  <Text style={s.cardSubtitle}>Select how this order will be served</Text>
                </View>
                <View style={s.cardRow}>
                  <Text style={s.cardRowText}>Dine In</Text>
                </View>
                <View style={s.cardDividerInset} />
                <View style={s.cardRow}>
                  <Text style={s.cardRowText}>Pick Up</Text>
                </View>
                <View style={s.cardDividerInset} />
                <View style={s.cardRow}>
                  <Text style={s.cardRowText}>Delivery</Text>
                </View>
                <View style={s.cardDividerFull} />
                <View style={s.cardCTA}>
                  <Text style={s.cardCTAText}>Confirm</Text>
                </View>
              </View>

              <View style={s.card}>
                <View style={s.cardAccentBar} />
                <View style={s.cardHeaderBand}>
                  <View style={s.cardIconCircle}>
                    <View style={s.cardIconDot} />
                  </View>
                  <Text style={[s.cardTitle, { fontWeight: '700', color: Colors.black }]}>Cancel Order</Text>
                  <Text style={s.cardSubtitle}>Select a reason to void this order</Text>
                </View>
                <View style={s.cardDividerFull} />
                <View style={s.cardRow}>
                  <View style={s.cardRowDot} />
                  <Text style={s.cardRowText}>Product not available</Text>
                </View>
                <View style={s.cardDividerInset} />
                <View style={s.cardRow}>
                  <View style={s.cardRowDot} />
                  <Text style={s.cardRowText}>Customer cancelled</Text>
                </View>
                <View style={s.cardDividerFull} />
                <View style={s.cardCancelFooter}>
                  <Text style={s.cardCancelText}>Cancel</Text>
                </View>
              </View>
            </View>

            <SubHead label="Anatomy Tokens" />
            <View style={s.actionSpecGrid}>
              <Token k="card width" v="360–380px" />
              <Token k="borderRadius" v="24" />
              <Token k="bg" v="Colors.white" />
              <Token k="shadow opacity" v="0.18–0.22" />
              <Token k="shadow radius" v="24–28" />
              <Token k="header bg" v="grayLight" />
              <Token k="header height" v="72px" />
              <Token k="header title" v="20px · 600 · primary" />
              <Token k="header subtitle" v="13px · 400 · grayText" />
              <Token k="row pad H" v="26px" />
              <Token k="row pad V" v="20px" />
              <Token k="row label" v="16–20px · 500 · primary" />
              <Token k="inset divider" v="0.5px · marginLeft 24" />
              <Token k="full divider" v="1px · grayBorder" />
              <Token k="CTA height" v="56px · borderRadius 14" />
              <Token k="accent bar" v="4px · Colors.red (danger only)" />
              <Token k="icon circle" v="52×52 · #FAE8E8" />
              <Token k="icon dot" v="20×20 · Colors.red" />
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── STATUS ─── */}
          <View onLayout={e => measureSection('status', e.nativeEvent.layout.y)}>
            <SectionHead title="Status Indicators" sub="Visual feedback for app states." />
            <Row>
              {[
                { label: 'Clocked In',   color: Colors.green,   bg: '#E8F5EE', desc: 'Colors.green · #4CAF82' },
                { label: 'Clocked Out',  color: Colors.grayMid, bg: Colors.grayLight, desc: 'Colors.grayMid · #D8D8D8' },
                { label: 'Order Active', color: Colors.primary,  bg: Colors.primaryLight, desc: 'Colors.primary' },
                { label: 'Order Voided', color: Colors.red,      bg: '#FAE8E8', desc: 'Colors.red · #D45757' },
                { label: 'Till Open',    color: Colors.green,   bg: '#E8F5EE', desc: 'Colors.green' },
                { label: 'Till Closed',  color: Colors.red,      bg: '#FAE8E8', desc: 'Colors.red' },
              ].map(st => (
                <View key={st.label} style={[s.statusCard, { backgroundColor: st.bg }]}>
                  <View style={[s.statusDot, { backgroundColor: st.color }]} />
                  <Text style={[s.statusLabel, { color: st.color }]}>{st.label}</Text>
                  <Text style={s.statusDesc}>{st.desc}</Text>
                </View>
              ))}
            </Row>

            <SubHead label="Void Order Flow States" />
            <View style={s.flowRow}>
              {['Normal Order', '→', 'Void Reason Dialog', '→', 'isVoided = true', '→', 'Tap NEW · Reset'].map((step, i) => (
                <View key={i} style={i % 2 === 0 ? s.flowStep : s.flowArrow}>
                  <Text style={i % 2 === 0 ? s.flowStepText : s.flowArrowText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── GLASSMORPHISM ─── */}
          <View onLayout={e => measureSection('glass', e.nativeEvent.layout.y)}>
            <SectionHead title="Glassmorphism" sub="Product card overlay. expo-blur BlurView. Real backdrop blur on iOS/Android." />
            <Row>
              <View style={s.glassCard}>
                <View style={s.glassCardBg} />
                <BlurView intensity={48} tint="dark" style={s.glassOverlay}>
                  <Text style={s.glassText}>Grilled Chicken</Text>
                </BlurView>
              </View>
              <View style={s.glassCard}>
                <View style={[s.glassCardBg, { backgroundColor: Colors.goldShade }]} />
                <BlurView intensity={48} tint="dark" style={s.glassOverlay}>
                  <Text style={s.glassText}>Beef Steak — Long Name</Text>
                </BlurView>
              </View>
              <View style={s.glassCard}>
                <View style={[s.glassCardBg, { backgroundColor: Colors.green }]} />
                <BlurView intensity={48} tint="dark" style={s.glassOverlay}>
                  <Text style={s.glassText}>Garden{'\n'}Salad</Text>
                </BlurView>
              </View>
            </Row>
            <View style={s.actionSpecGrid}>
              <Token k="component" v="expo-blur BlurView" />
              <Token k="intensity" v="48" />
              <Token k="tint" v="dark" />
              <Token k="position" v="absolute · bottom 0 · left/right 0" />
              <Token k="padding H" v="8px" />
              <Token k="padding V" v="7px" />
              <Token k="borderTopWidth" v="0.5px" />
              <Token k="borderTopColor" v="rgba(255,255,255,0.2)" />
              <Token k="borderRadius" v="0,0,14,14 (matches card)" />
              <Token k="text color" v="Colors.white · 13px · 600" />
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── ICON SIZES ─── */}
          <View onLayout={e => measureSection('icons', e.nativeEvent.layout.y)}>
            <SectionHead title="Icon Sizes" sub="All icon dimensions used across the app. resizeMode: contain." />
            <Row gap={20}>
              {[
                { size: 16, label: '16×16', usage: 'Close (x) icon in order items' },
                { size: 18, label: '18×18', usage: 'SAR currency icon (dark/gray)' },
                { size: 22, label: '22×22', usage: 'Chevron in total button · tab icons · search icon' },
                { size: 24, label: '24×24', usage: 'More menu icons' },
                { size: 36, label: '36×36', usage: 'Action bar icons' },
                { size: 52, label: '52×52', usage: 'Void icon circle container' },
              ].map(ic => (
                <View key={ic.size} style={s.iconSizeCard}>
                  <View style={[s.iconSizeBox, { width: ic.size, height: ic.size, borderRadius: ic.size * 0.2 }]} />
                  <Text style={s.iconSizeLabel}>{ic.label}</Text>
                  <Text style={s.iconSizeUsage}>{ic.usage}</Text>
                </View>
              ))}
            </Row>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── MOTION ─── */}
          <View onLayout={e => measureSection('motion', e.nativeEvent.layout.y)}>
            <SectionHead title="Motion & Interaction" sub="Touch feedback values. No animations beyond modal fade." />
            <View style={s.motionTable}>
              {[
                { component: 'CTA Button',       prop: 'activeOpacity', value: '0.8' },
                { component: 'Action Bar Btn',   prop: 'activeOpacity', value: '0.8' },
                { component: 'Tab Item',         prop: 'activeOpacity', value: '0.7' },
                { component: 'Order Item Row',   prop: 'activeOpacity', value: '0.8 (1 when voided)' },
                { component: 'Category Card',    prop: 'activeOpacity', value: '0.85' },
                { component: 'Product Card',     prop: 'activeOpacity', value: '0.85' },
                { component: 'Home Menu Item',   prop: 'activeOpacity', value: '0.7' },
                { component: 'Sync Button',      prop: 'activeOpacity', value: '0.7' },
                { component: 'Dialog CTA',       prop: 'activeOpacity', value: '0.65–0.85' },
                { component: 'Dialog Backdrop',  prop: 'onPress',       value: 'closes modal' },
                { component: 'Modal',            prop: 'animationType',  value: '"fade"' },
                { component: 'Modal',            prop: 'statusBarTranslucent', value: 'true' },
              ].map(m => (
                <View key={m.component + m.prop} style={s.motionRow}>
                  <Text style={s.motionComponent}>{m.component}</Text>
                  <Text style={s.motionProp}>{m.prop}</Text>
                  <Text style={s.motionValue}>{m.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.sectionDivider} />

          {/* ─── LAYOUT ─── */}
          <View onLayout={e => measureSection('layout', e.nativeEvent.layout.y)}>
            <SectionHead title="Layout System" sub="iPad landscape. Fixed left panel, flex right content. No navigation library." />

            <SubHead label="Screen Structure" />
            <View style={s.layoutDiagram}>
              <View style={s.layoutLeft}>
                <Text style={s.layoutLeftLabel}>ORDER{'\n'}PANEL</Text>
                <Text style={s.layoutLeftSub}>350px fixed</Text>
              </View>
              <View style={s.layoutRight}>
                <View style={s.layoutActionBar}><Text style={s.layoutBarLabel}>ACTION BAR</Text></View>
                <View style={s.layoutSearchBar}><Text style={s.layoutBarLabel}>SEARCH BAR</Text></View>
                <View style={s.layoutGrid}><Text style={s.layoutBarLabel}>PRODUCT / CATEGORY GRID  (flex: 1)</Text></View>
                <View style={s.layoutTabBar}><Text style={s.layoutBarLabel}>TAB BAR</Text></View>
              </View>
            </View>

            <SubHead label="Navigation Model" />
            <View style={s.navModel}>
              {['login', '→', 'welcome', '→', 'home', '→', 'products', '→', 'payment'].map((step, i) => (
                <View key={i} style={i % 2 === 0 ? s.navStep : s.navArrow}>
                  <Text style={i % 2 === 0 ? s.navStepText : s.navArrowText}>{step}</Text>
                </View>
              ))}
            </View>
            <Text style={s.navNote}>Navigation via useState&lt;Screen&gt; in App.tsx — no navigation library</Text>

            <SubHead label="Layout Tokens" />
            <View style={s.actionSpecGrid}>
              <Token k="LEFT_PANEL_W" v="350px" />
              <Token k="SCREEN_PAD / RIGHT_PAD" v="20px" />
              <Token k="CARD_GAP" v="14px" />
              <Token k="Grid COLS" v="5" />
              <Token k="PAGE_SIZE" v="12 products/page" />
              <Token k="Tab bar height" v="64px" />
              <Token k="Action bar mb" v="12px" />
              <Token k="Search bar height" v="60px · mb 12px" />
            </View>

            <SubHead label="Screens" />
            <View style={s.screenTable}>
              {[
                { screen: 'LoginScreen',          file: 'LoginScreen.tsx',          desc: 'PIN entry · 5 digits · employee selection' },
                { screen: 'WelcomeScreen',         file: 'WelcomeScreen.tsx',        desc: 'Clock in/out · till open/close' },
                { screen: 'HomeScreen',            file: 'HomeScreen.tsx',           desc: 'Category grid 5×n · cart sidebar' },
                { screen: 'HomeProductsScreen',    file: 'HomeProductsScreen.tsx',   desc: 'Product grid 5×n · pagination · edit item panel' },
                { screen: 'PaymentScreen',         file: 'PaymentScreen.tsx',        desc: 'Checkout · payment methods' },
                { screen: 'DesignSystemScreen',    file: 'DesignSystemScreen.tsx',   desc: 'This screen · design reference' },
              ].map(r => (
                <View key={r.screen} style={s.screenRow}>
                  <Text style={s.screenName}>{r.screen}</Text>
                  <Text style={s.screenFile}>{r.file}</Text>
                  <Text style={s.screenDesc}>{r.desc}</Text>
                </View>
              ))}
            </View>

            <SubHead label="Key Components" />
            <View style={s.screenTable}>
              {[
                { screen: 'OrderPanel',       file: 'OrderPanel.tsx',       desc: 'Left sidebar cart · accepts isVoided prop' },
                { screen: 'MoreMenu',         file: 'MoreMenu.tsx',         desc: 'Home button overlay menu' },
                { screen: 'ConfirmDialog',    file: 'ConfirmDialog.tsx',    desc: 'Yes / No confirmation dialog' },
                { screen: 'OrderTypeDialog',  file: 'OrderTypeDialog.tsx',  desc: 'Dine In / Pick Up / Delivery / Drive Thru' },
                { screen: 'TillAmountDialog', file: 'TillAmountDialog.tsx', desc: 'Numpad amount entry for till' },
                { screen: 'VoidReasonDialog', file: 'VoidReasonDialog.tsx', desc: 'Void reason selection · danger variant' },
              ].map(r => (
                <View key={r.screen} style={s.screenRow}>
                  <Text style={s.screenName}>{r.screen}</Text>
                  <Text style={s.screenFile}>{r.file}</Text>
                  <Text style={s.screenDesc}>{r.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>

      {/* Modals */}
      <ConfirmDialog visible={confirmVisible} title="Confirm Action" message="Are you sure you want to proceed?" onNo={() => setConfirmVisible(false)} onYes={() => setConfirmVisible(false)} />
      <VoidReasonDialog visible={voidVisible} onClose={() => setVoidVisible(false)} onSelectReason={() => setVoidVisible(false)} />
      <OrderTypeDialog visible={orderTypeVisible} onClose={() => setOrderTypeVisible(false)} onSelect={() => setOrderTypeVisible(false)} />
      <TillAmountDialog visible={tillVisible} onClose={() => setTillVisible(false)} onDone={() => setTillVisible(false)} ctaLabel="Open Till" />
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ColorSwatch({ token, hex, label }: { token: string; hex: string; label: string }) {
  const isLight = hex.startsWith('#F') || hex.startsWith('#E') || hex.startsWith('#D') || hex === '#FFFFFF' || hex === '#C9C9C9';
  return (
    <View style={h.swatchWrap}>
      <View style={[h.swatchColor, { backgroundColor: hex }, isLight && h.swatchBorder]}>
        <Text style={[h.swatchOnColor, { color: isLight ? Colors.primary : Colors.white }]}>Aa</Text>
      </View>
      <Text style={h.swatchToken}>Colors.{token}</Text>
      <Text style={h.swatchHex}>{hex}</Text>
      <Text style={h.swatchLabel}>{label}</Text>
    </View>
  );
}

function OrderItemRow({ label, qty, price, state }: { label: string; qty: number; price: string; state: 'default' | 'selected' | 'voided' }) {
  return (
    <View style={[h.itemRow, state === 'selected' && h.itemRowSelected, state === 'voided' && h.itemRowVoided]}>
      {state === 'selected' && <View style={h.itemBar} />}
      <View style={h.itemContent}>
        <Text style={h.itemQty}>{qty}</Text>
        <View style={h.itemX}><View style={h.itemXDot} /></View>
        <Text style={h.itemName} numberOfLines={1}>{label}</Text>
        <Text style={h.itemPrice}>SAR {price}</Text>
      </View>
    </View>
  );
}

// ─── Helper styles ────────────────────────────────────────────────────────────
const h = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 11, fontWeight: '600', letterSpacing: -0.1 },
  token: { backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.grayBorder, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  tokenKey: { fontSize: 10, fontWeight: '600', color: Colors.grayText, letterSpacing: 0.3, textTransform: 'uppercase' },
  tokenVal: { fontSize: 13, fontWeight: '600', color: Colors.primary, letterSpacing: -0.2 },
  sHead: { marginBottom: 20 },
  sHeadTitle: { fontSize: 20, fontWeight: '700', color: Colors.primary, letterSpacing: -0.4 },
  sHeadSub: { fontSize: 13, fontWeight: '400', color: Colors.grayText, marginTop: 4 },
  subHead: { fontSize: 11, fontWeight: '700', color: Colors.grayText, letterSpacing: 1, textTransform: 'uppercase', marginTop: 20, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },

  swatchWrap: { width: 118, gap: 4, marginBottom: 4 },
  swatchColor: { height: 64, borderRadius: 12, alignItems: 'flex-end', justifyContent: 'flex-end', padding: 8 },
  swatchBorder: { borderWidth: 1, borderColor: Colors.grayBorder },
  swatchOnColor: { fontSize: 12, fontWeight: '700' },
  swatchToken: { fontSize: 11, fontWeight: '600', color: Colors.primary, letterSpacing: -0.1 },
  swatchHex: { fontSize: 11, fontWeight: '400', color: Colors.grayText },
  swatchLabel: { fontSize: 10, fontWeight: '400', color: Colors.placeholder, lineHeight: 14 },

  formRowPreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, minHeight: 68, gap: 16 },
  formRowLabel: { fontSize: 16, fontWeight: '500', color: Colors.black, letterSpacing: -0.25, minWidth: 110 },
  formRowInputBox: { flex: 1, height: 44, borderRadius: 10, backgroundColor: Colors.grayLight, borderWidth: 1.5, borderColor: 'transparent', paddingHorizontal: 12, justifyContent: 'center', outlineWidth: 0 },
  formRowInput: { fontSize: 15, fontWeight: '400', color: Colors.primary, letterSpacing: -0.2, textAlign: 'right', flex: 1, paddingHorizontal: 4, paddingVertical: 0, outlineWidth: 0 },

  cursor: { width: 2, height: 18, backgroundColor: Colors.primary, borderRadius: 1 },

  itemRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.grayBorder, position: 'relative' },
  itemRowSelected: { backgroundColor: Colors.primaryLight },
  itemRowVoided: { backgroundColor: Colors.liteColor2 },
  itemBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: Colors.primary, zIndex: 1 },
  itemContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 18, paddingRight: 14, paddingVertical: 14, gap: 8 },
  itemQty: { fontSize: 19, fontWeight: '400', color: Colors.black, letterSpacing: -0.095 },
  itemX: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.grayBorder, alignItems: 'center', justifyContent: 'center' },
  itemXDot: { width: 6, height: 1, backgroundColor: Colors.grayText },
  itemName: { flex: 1, fontSize: 14, fontWeight: '400', color: Colors.black, letterSpacing: -0.07 },
  itemPrice: { fontSize: 18, fontWeight: '600', color: Colors.black, letterSpacing: -0.09 },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundAlt },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 28, paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerBadgeText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white, letterSpacing: -0.4 },
  headerSub: { fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  closeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },

  body: { flex: 1, flexDirection: 'row' },

  sidebar: { width: 168, backgroundColor: Colors.white, borderRightWidth: 1, borderRightColor: Colors.grayBorder },
  sidebarContent: { paddingTop: 20, paddingBottom: 40 },
  sidebarLabel: { fontSize: 10, fontWeight: '700', color: Colors.placeholder, letterSpacing: 1.2, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 },
  navItem: { paddingHorizontal: 16, paddingVertical: 11, marginHorizontal: 8, borderRadius: 10 },
  navItemActive: { backgroundColor: Colors.primaryLight },
  navLabel: { fontSize: 13, fontWeight: '500', color: Colors.grayText },
  navLabelActive: { color: Colors.primary, fontWeight: '600' },

  content: { flex: 1 },
  contentInner: { padding: 36, gap: 0 },

  sectionDivider: { height: 1, backgroundColor: Colors.grayBorder, marginVertical: 40 },

  /* Brand */
  brandHero: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: Colors.primary, borderRadius: 20, padding: 32, marginBottom: 24, gap: 24 },
  brandHeroLeft: { flex: 1, gap: 12 },
  brandName: { fontSize: 40, fontWeight: '700', color: Colors.white, letterSpacing: -1.5 },
  brandTagline: { fontSize: 15, fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: -0.2 },
  brandDesc: { fontSize: 13, fontWeight: '400', color: 'rgba(255,255,255,0.5)', lineHeight: 20 },
  brandPaletteMini: { flexDirection: 'column', gap: 8, paddingTop: 4 },
  brandPaletteDot: { width: 32, height: 32, borderRadius: 16 },
  principleCard: { flex: 1, minWidth: 160, backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 6, borderWidth: 1, borderColor: Colors.grayBorder },
  principleTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, letterSpacing: -0.2 },
  principleDesc: { fontSize: 12, fontWeight: '400', color: Colors.grayText, lineHeight: 18 },

  /* Color */
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  usageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  usageCard: { width: 180, height: 80, borderRadius: 12, padding: 14, justifyContent: 'space-between' },
  usageLabel: { fontSize: 12, fontWeight: '600', letterSpacing: -0.2 },
  usageBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  usageBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  /* Typography */
  typeTable: { gap: 0 },
  typeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.grayBorder, gap: 16 },
  typeRoleCol: { width: 160, gap: 2 },
  typeRole: { fontSize: 12, fontWeight: '600', color: Colors.primary, letterSpacing: -0.1 },
  typeMeta: { fontSize: 10, fontWeight: '400', color: Colors.placeholder },
  typeSampleCol: { flex: 1 },
  weightCard: { flex: 1, minWidth: 120, backgroundColor: Colors.white, borderRadius: 14, padding: 20, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.grayBorder },
  weightSample: { fontSize: 48, color: Colors.primary, letterSpacing: -1 },
  weightLabel: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  weightUsage: { fontSize: 11, fontWeight: '400', color: Colors.grayText, textAlign: 'center' },
  lsCard: { flex: 1, minWidth: 80, backgroundColor: Colors.white, borderRadius: 12, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.grayBorder },
  lsSample: { fontSize: 18, fontWeight: '600', color: Colors.primary },
  lsLabel: { fontSize: 11, fontWeight: '500', color: Colors.grayText },

  /* Spacing */
  spacingTable: { gap: 6 },
  spacingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 2 },
  spacingValue: { width: 44, fontSize: 12, fontWeight: '600', color: Colors.primary, textAlign: 'right' },
  spacingTrack: { width: 300, height: 16, backgroundColor: Colors.grayLight, borderRadius: 4, overflow: 'hidden' },
  spacingFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4, opacity: 0.7 },
  spacingNote: { flex: 1, fontSize: 11, fontWeight: '400', color: Colors.grayText },

  /* Radius */
  radiusItem: { alignItems: 'center', gap: 8 },
  radiusBox: { backgroundColor: Colors.primary, opacity: 0.85 },
  radiusVal: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  radiusUsage: { fontSize: 10, fontWeight: '400', color: Colors.grayText, textAlign: 'center', maxWidth: 90 },

  /* Shadows */
  shadowCard: { alignItems: 'center', gap: 10 },
  shadowBox: { width: 90, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shadowBoxLabel: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  shadowLabel: { fontSize: 12, fontWeight: '600', color: Colors.primary, textAlign: 'center' },
  shadowDesc: { fontSize: 10, fontWeight: '400', color: Colors.grayText, textAlign: 'center', maxWidth: 120, lineHeight: 14 },

  /* Dividers */
  dividerShowcase: { gap: 16 },
  dividerRow: { gap: 8 },
  dividerLabel: { fontSize: 11, fontWeight: '500', color: Colors.grayText },
  dividerLine: { flexDirection: 'row' },

  /* Buttons */
  ctaBtn: { height: 56, borderRadius: 14, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', minWidth: 180 },
  ctaBtnText: { fontSize: 17, fontWeight: '700', color: Colors.white, letterSpacing: -0.2 },
  actionBarRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 14, alignItems: 'center', gap: 8, minWidth: 72, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
  actionBtnDanger: { backgroundColor: Colors.red, shadowColor: Colors.redShadow },
  actionIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)' },
  actionBtnLabel: { fontSize: 12, fontWeight: '500', color: Colors.white, letterSpacing: 0.2 },
  actionSpecGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  iconBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconBtnDot: { width: 20, height: 20, borderRadius: 10 },

  /* Inputs */
  searchBar: { height: 60, backgroundColor: Colors.white, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent', shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  searchBarFocused: { borderColor: Colors.primary },
  searchIconWrap: { width: 52, alignItems: 'center', justifyContent: 'center' },
  searchIconDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.grayMid, opacity: 0.35 },
  searchPlaceholder: { flex: 1, fontSize: 16, color: Colors.placeholder },
  searchCursor: { width: 2, height: 20, backgroundColor: Colors.primary, marginRight: 16 },
  pinKey: { width: 84, height: 84, borderRadius: 14, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  pinKeyDelete: { backgroundColor: Colors.grayLight },
  pinKeyText: { fontSize: 28, fontWeight: '400', color: Colors.primary },

  /* Dialog search bar */
  dialogSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.grayLight, borderRadius: 12, borderWidth: 1, borderColor: Colors.grayBorder, paddingHorizontal: 14, height: 56, gap: 10 },
  dsSearchIcon: { width: 20, height: 20, resizeMode: 'contain', opacity: 0.45 },
  dsSearchPlaceholder: { flex: 1, fontSize: 16, color: Colors.placeholder, letterSpacing: -0.2 },

  /* Form card container */
  formCard: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.grayBorder, marginBottom: 4, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  formRowDivider: { height: 0.5, backgroundColor: 'rgba(60,60,67,0.29)', marginLeft: 20 },

  /* Form row states */
  formStateRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  formStateItem: { gap: 8, flex: 1, minWidth: 160 },
  formStateRow2: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.grayBorder },
  formStateBox: { flex: 1, height: 36, borderRadius: 8, paddingHorizontal: 10, justifyContent: 'center', borderWidth: 1.5 },
  formStateBoxDefault: { backgroundColor: Colors.grayLight, borderColor: 'transparent' },
  formStateBoxFocused: { backgroundColor: Colors.white, borderColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 2 },
  formStateBoxDisabled: { backgroundColor: Colors.grayLight, borderColor: 'transparent' },
  formStateLabelFocused: { color: Colors.primary, fontWeight: '600' },
  formStateLabel: { fontSize: 13, fontWeight: '500', color: Colors.black, letterSpacing: -0.2 },
  formStatePlaceholder: { fontSize: 13, fontWeight: '400', color: Colors.placeholder, letterSpacing: -0.15 },
  formStateValue: { fontSize: 13, fontWeight: '400', color: Colors.primary, letterSpacing: -0.15 },
  formStateFocusedRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  formStateCaption: { fontSize: 11, fontWeight: '500', color: Colors.grayText, letterSpacing: 0.2, textAlign: 'center' },

  /* Tab bar */
  tabBar: { backgroundColor: Colors.white, flexDirection: 'row', borderRadius: 14, paddingHorizontal: 8, height: 64, alignItems: 'center', shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  tabItemActive: { backgroundColor: Colors.primaryLight },
  tabIconBox: { width: 22, height: 22, borderRadius: 4, backgroundColor: Colors.grayMid, opacity: 0.45 },
  tabLabel: { fontSize: 13, fontWeight: '700', color: Colors.grayText, letterSpacing: 0.4 },
  tabLabelActive: { color: Colors.primary },

  /* Order panel preview */
  panelPreview: { width: 320, backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  panelHeader: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14, gap: 10 },
  panelHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelOrderType: { fontSize: 16, fontWeight: '600', color: Colors.primary, letterSpacing: -0.075 },
  panelAddCustomer: { fontSize: 16, fontWeight: '600', color: Colors.yellowGold, textDecorationLine: 'underline' },
  panelCount: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  panelActive: { fontSize: 16, fontWeight: '500', color: Colors.black },
  addCourse: { backgroundColor: Colors.grayLight, paddingVertical: 16, alignItems: 'center' },
  addCourseText: { fontSize: 14, fontWeight: '600', color: Colors.grayText },
  taxesRow: { backgroundColor: Colors.grayLight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.grayBorder },
  taxesLabel: { fontSize: 15, fontWeight: '500', color: Colors.grayText },
  taxesVal: { fontSize: 15, fontWeight: '500', color: Colors.grayText },
  totalBtn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 20 },
  totalLabel: { fontSize: 23, fontWeight: '600', color: Colors.white, letterSpacing: -0.115 },
  totalAmount: { fontSize: 23, fontWeight: '600', color: Colors.white, letterSpacing: -0.115 },

  /* Dialogs */
  dialogTile: { minWidth: 200, flex: 1, backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.grayBorder, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  dialogTileAccent: { height: 4, backgroundColor: Colors.primary },
  dialogTileBody: { padding: 20, gap: 8 },
  dialogTileLabel: { fontSize: 14, fontWeight: '700', color: Colors.primary, letterSpacing: -0.2 },
  dialogTileSub: { fontSize: 12, fontWeight: '400', color: Colors.grayText },
  dialogTileBtn: { alignSelf: 'flex-start', backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginTop: 4 },
  dialogTileBtnText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  backdropDemo: { height: 80, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 4 },
  backdropDemoInner: { alignItems: 'center', gap: 4 },
  backdropDemoText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  backdropDemoSub: { fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.6)' },

  /* Card anatomy */
  cardShowcaseRow: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
  card: { width: 360, backgroundColor: Colors.white, borderRadius: 24, overflow: 'hidden', shadowColor: Colors.black, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 28, elevation: 14 },
  cardAccentBar: { height: 4, backgroundColor: Colors.red },
  cardHeaderBand: { backgroundColor: Colors.grayLight, paddingVertical: 24, paddingHorizontal: 32, alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary, letterSpacing: -0.4 },
  cardSubtitle: { fontSize: 13, fontWeight: '400', color: Colors.grayText },
  cardIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FAE8E8', alignItems: 'center', justifyContent: 'center' },
  cardIconDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.red },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 26, paddingVertical: 20, gap: 14 },
  cardRowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red, flexShrink: 0 },
  cardRowText: { fontSize: 16, fontWeight: '500', color: Colors.primary, letterSpacing: -0.3 },
  cardDividerInset: { height: 0.5, backgroundColor: 'rgba(60,60,67,0.18)', marginHorizontal: 20 },
  cardDividerFull: { height: 1, backgroundColor: Colors.grayBorder },
  cardCTA: { margin: 16, height: 56, backgroundColor: Colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardCTAText: { fontSize: 17, fontWeight: '700', color: Colors.white, letterSpacing: -0.2 },
  cardCancelFooter: { paddingVertical: 18, alignItems: 'center', backgroundColor: Colors.white },
  cardCancelText: { fontSize: 15, fontWeight: '600', color: Colors.grayText },

  /* Status */
  statusCard: { flex: 1, minWidth: 130, borderRadius: 12, padding: 14, gap: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 13, fontWeight: '700' },
  statusDesc: { fontSize: 10, fontWeight: '400', color: Colors.grayText },
  flowRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  flowStep: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  flowStepText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  flowArrow: {},
  flowArrowText: { fontSize: 16, color: Colors.grayMid },

  /* Glassmorphism */
  glassCard: { width: 140, height: 140, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  glassCardBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.primary },
  glassOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.2)', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, paddingHorizontal: 8, paddingVertical: 7, overflow: 'hidden' },
  glassText: { fontSize: 13, fontWeight: '600', color: Colors.white, textAlign: 'center', lineHeight: 17, letterSpacing: -0.065 },

  /* Icons */
  iconSizeCard: { alignItems: 'center', gap: 8 },
  iconSizeBox: { backgroundColor: Colors.primary, opacity: 0.8 },
  iconSizeLabel: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  iconSizeUsage: { fontSize: 10, fontWeight: '400', color: Colors.grayText, textAlign: 'center', maxWidth: 100 },

  /* Motion */
  motionTable: { gap: 0, backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.grayBorder },
  motionRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.grayBorder, gap: 16 },
  motionComponent: { width: 180, fontSize: 13, fontWeight: '500', color: Colors.primary },
  motionProp: { width: 140, fontSize: 12, fontWeight: '400', color: Colors.grayText },
  motionValue: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.black },

  /* Layout */
  layoutDiagram: { flexDirection: 'row', height: 280, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.grayBorder },
  layoutLeft: { width: 100, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', gap: 6 },
  layoutLeftLabel: { fontSize: 11, fontWeight: '700', color: Colors.white, textAlign: 'center', letterSpacing: 0.5 },
  layoutLeftSub: { fontSize: 9, fontWeight: '400', color: 'rgba(255,255,255,0.5)' },
  layoutRight: { flex: 1, backgroundColor: Colors.backgroundAlt, padding: 8, gap: 6 },
  layoutActionBar: { height: 36, backgroundColor: Colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', opacity: 0.7 },
  layoutSearchBar: { height: 28, backgroundColor: Colors.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.grayBorder },
  layoutGrid: { flex: 1, backgroundColor: Colors.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.grayBorder },
  layoutTabBar: { height: 32, backgroundColor: Colors.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.grayBorder },
  layoutBarLabel: { fontSize: 9, fontWeight: '600', color: Colors.grayText, letterSpacing: 0.5 },
  navModel: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  navStep: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  navStepText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  navArrow: {},
  navArrowText: { fontSize: 16, color: Colors.grayMid },
  navNote: { fontSize: 12, fontWeight: '400', color: Colors.grayText, fontStyle: 'italic', marginBottom: 4 },
  screenTable: { gap: 0, backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.grayBorder },
  screenRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.grayBorder, gap: 16 },
  screenName: { width: 200, fontSize: 13, fontWeight: '600', color: Colors.primary },
  screenFile: { width: 200, fontSize: 12, fontWeight: '400', color: Colors.grayText },
  screenDesc: { flex: 1, fontSize: 12, fontWeight: '400', color: Colors.black },
});
