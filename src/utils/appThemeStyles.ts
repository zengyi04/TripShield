import { StyleSheet } from 'react-native';
import { APP_COLORS, APP_TYPO, HOME_HEADER_BAR, HOME_HEADER_ICON_BTN, HOME_HEADER_TITLE } from './appTheme';

export const appThemeStyles = StyleSheet.create({
  fullScreen: { flex: 1 },
  homeHeaderBar: HOME_HEADER_BAR,
  screenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  headerSideSlot: {
    width: HOME_HEADER_ICON_BTN.width,
    height: HOME_HEADER_ICON_BTN.height,
  },
  screenHeaderTitle: {
    flex: 1,
    ...HOME_HEADER_TITLE,
  },
  headerIconBtn: HOME_HEADER_ICON_BTN,
  sectionEyebrow: {
    fontSize: APP_TYPO.labelCaps,
    fontWeight: '800',
    color: APP_COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.cardBorder,
    shadowColor: APP_COLORS.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: APP_TYPO.sectionTitle,
    fontWeight: '700',
    color: APP_COLORS.textSecondary,
    marginBottom: 12,
  },
  body: {
    fontSize: APP_TYPO.bodySmall,
    color: APP_COLORS.textMuted,
    lineHeight: 20,
  },
  /** @deprecated use homeHeaderBar + screenHeaderRow via ScreenTopBar */
  screenHeader: {
    ...HOME_HEADER_BAR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  screenHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  screenHeaderSubtitle: {
    fontSize: APP_TYPO.screenSubtitle,
    fontWeight: '600',
    color: APP_COLORS.textSoft,
    textAlign: 'center',
    marginTop: 2,
  },
});
