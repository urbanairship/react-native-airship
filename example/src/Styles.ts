/* Copyright Airship and Contributors */

import { StyleSheet } from 'react-native';

/**
 * Airship Example App Styles
 * 
 * This file contains all styles for the Airship Example App, organized by usage.
 * - Common styles are shared across multiple screens
 * - Each section-specific styles are grouped together
 * - Screen-specific styles are in their own section
 */

// Colors - design system
const Colors = {
  // Primary palette
  primaryDark: '#001f9e',   // Dark blue
  primary: '#004bff',       // Light blue
  accent: '#f1084f',        // Red
  success: '#6ca15f',       // Green
  
  // Neutral palette
  text: '#020202',          // Black text
  textSecondary: '#666666', // Secondary text
  background: '#F8F8F8',    // Background gray
  cardBackground: '#FFFFFF',// Card background
  border: '#E0E0E0',        // Border color
  
  // Semantic colors
  error: '#D32F2F',
  warning: '#FFEBEE',
  overlay: 'rgba(255, 255, 255, 0.7)',
};

// Typography presets
const Typography = {
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  body: {
    fontSize: 14,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
};

// Spacing and layout constants
const Spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
};

// Common shadow styles
const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
};

export default StyleSheet.create({
  /**
   * Shared Layout Components
   * Used across multiple screens
   */
  container: {
    flex: 1,
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  /**
   * Card & Section Components
   */
  // Base card/section container
  section: {
    marginBottom: Spacing.l,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: Spacing.l,
    ...Shadows.small,
  },
  // Section header with bottom border
  sectionHeader: {
    marginBottom: Spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.m,
  },
  // Section title (used in headers)
  sectionTitle: {
    ...Typography.title,
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  // Section subtitle (used in headers and descriptions)
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  
  /**
   * Loading & Status Indicators
   */
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  /**
   * Warning & Error Components 
   */
  warningContainer: {
    backgroundColor: Colors.warning,
    borderRadius: 10,
    padding: Spacing.l,
    margin: Spacing.l,
  },
  warningView: {
    padding: Spacing.l,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    marginBottom: Spacing.s,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: Spacing.s,
  },
  warningText: {
    fontSize: 16,
    color: Colors.error,
  },
  warningTitleText: {
    fontWeight: 'bold',
    color: Colors.cardBackground,
  },
  warningBodyText: {
    color: Colors.border,
  },
  
  /**
   * Form Elements
   */
  // Text fields
  textInput: {
    flex: 1,
    color: Colors.primaryDark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    marginRight: Spacing.s,
  },
  // Input row with label and field
  inputRow: {
    flexDirection: 'row',
    marginBottom: Spacing.s,
  },
  // Standard button 
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: Spacing.m,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.cardBackground,
    fontWeight: 'bold',
  },
  
  /**
   * List Items & Chips
   */
  item: {
    opacity: 1,
    padding: Spacing.m,
  },
  itemTitle: {
    ...Typography.title,
  },
  itemSubtitle: {
    ...Typography.body,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#CEDCCE',
    marginTop: Spacing.l,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: 15,
    margin: 4,
    ...Shadows.small,
  },
  chipText: {
    color: Colors.text,
    marginRight: Spacing.s,
  },
  
  /**
   * HOME SCREEN
   */
  // Embedded View
  homeHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.m,
  },
  title: {
    ...Typography.title,
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  embeddedContainer: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    marginBottom: Spacing.s,
  },
  embeddedCaption: {
    ...Typography.caption,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Channel ID
  channelIdContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: Spacing.m,
  },
  channelIdLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  channelIdValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  
  // Push Notifications
  pushContainer: {
    padding: Spacing.s,
  },
  pushButton: {
    padding: Spacing.m,
    borderRadius: 8,
    alignItems: 'center',
  },
  pushButtonText: {
    color: Colors.cardBackground,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Named User
  namedUserContainer: {
    padding: Spacing.s,
  },
  namedUserLabel: {
    marginBottom: Spacing.s,
    fontSize: 14,
  },
  
  // Tags
  tagsContainer: {
    padding: Spacing.s,
  },
  tagsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.s,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4F8',
    borderRadius: 16,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.m,
    margin: 4,
  },
  tagChipText: {
    marginRight: Spacing.xs,
    color: Colors.primaryDark,
  },
  tagRemoveButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRemoveButtonText: {
    color: Colors.cardBackground,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Live Activities
  liveButtonRow: {
    marginBottom: Spacing.m,
  },
  
  /**
   * MESSAGE CENTER SCREEN
   */
  // No specific styles - using shared list components
  
  /**
   * PREFERENCE CENTER SCREEN
   */
  pcContainer: {
    padding: 0,
    flex: 1,
  },
  sectionHeaderContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  cellTitle: {
    fontSize: 20,
    color: Colors.text,
  },
  cellSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  pcCellContainer: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.xs,
  },
  
  // Subscription Components
  alertContainer: {
    borderWidth: 1,
    borderRadius: 3,
    flex: 0.25,
    backgroundColor: '#3399ff',
  },
  scopeContainer: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.m,
    borderRadius: 20,
  },
  subscribedScopeButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 15,
    padding: Spacing.m,
  },
  unsubscribedScopeButton: {
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 15,
    padding: Spacing.m,
  },
  scopeText: {
    color: Colors.cardBackground,
    fontSize: 12,
    alignSelf: 'center',
  },
  
  /**
   * CUSTOM EVENTS SCREEN
   */
  // Form elements
  label: {
    fontSize: 16,
    marginBottom: Spacing.s,
    color: '#333333',
  },
  inputGroup: {
    marginBottom: Spacing.l,
  },
  propertiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.m,
  },
  addButtonText: {
    color: Colors.cardBackground,
    fontWeight: 'bold',
  },
  propertyRow: {
    flexDirection: 'row',
    marginBottom: Spacing.m,
    alignItems: 'center',
  },
  propertyKey: {
    flex: 0.4,
    marginRight: Spacing.s,
  },
  propertyValue: {
    flex: 0.6,
    marginRight: Spacing.s,
  },
  
  // Action buttons
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: Colors.cardBackground,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: Spacing.l,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  sendButtonText: {
    color: Colors.cardBackground,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Examples section
  examplesContainer: {
    flexDirection: 'row',
    marginTop: Spacing.m,
  },
  exampleCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: Spacing.l,
    marginRight: Spacing.l,
    width: 200,
    ...Shadows.small,
  },
  exampleTitle: {
    ...Typography.title,
    fontSize: 16,
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  exampleDescription: {
    ...Typography.body,
  },
  
  /**
   * MISCELLANEOUS / LEGACY SUPPORT
   */
  // Supporting legacy components
  channelCellContents: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.m,
  },
  backgroundIcon: {
    width: '50%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    alignItems: 'center',
  },
  backgroundContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.cardBackground,
  },
  contentContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  stackRight: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: Colors.cardBackground,
  },
  cellContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginTop: 15,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  miniCellContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  namedUserCellContainer: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
  },
  managerCell: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.m,
  },
  channel: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  rowLabel: {
    flexDirection: 'row',
    color: '#0d6a83',
    fontSize: 16,
    marginRight: Spacing.m,
  },
  instructions: {
    fontSize: 11,
    textAlign: 'center',
    color: '#0d6a83',
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36,
  },
  
  /**
   * UI ELEMENTS
   */
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
  },
  dash: {
    width: 6,
    height: 1,
    backgroundColor: Colors.cardBackground,
  },
  roundedView: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    ...Shadows.small,
  },
  enablePushButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.m,
    borderRadius: 15,
    backgroundColor: Colors.cardBackground,
    marginBottom: Spacing.s,
    ...Shadows.small,
  },
  enablePushRowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enablePushButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.border,
  },
  
  /**
   * APP COMPONENT STYLES
   */
  appContainer: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
  appLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  appLoadingText: {
    marginTop: 20,
    ...Typography.subtitle,
  },
  appErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.cardBackground,
  },
  appErrorTitle: {
    ...Typography.title,
    color: Colors.error,
    marginBottom: Spacing.m,
  },
  appErrorMessage: {
    textAlign: 'center',
    color: Colors.text,
  }
});