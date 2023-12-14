/* Copyright Airship and Contributors */

import { StyleSheet } from 'react-native';

// #004BFF - light airship blue
// #00017F - dark airship blue
// #6CA15F - light airship green
// #F1084F - light airship red

export default StyleSheet.create({
  channelCellContents: {
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  backgroundIcon: {
    width: '90%',
    resizeMode: 'contain',
    alignItems: 'center',
    padding: 20,
  },
  backgroundContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  stackRight: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  cellContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
  },
  namedUserCellContainer: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  managerCell: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  channel: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  rowLabel: {
    flexDirection: 'row',
    color: '#0d6a83',
    fontSize: 16,
    marginRight: 10,
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
  textInput: {
    flex: 1,
    color: '#00017F',
    flexDirection: 'row',
    borderColor: 'white',
    borderWidth: 1,
  },
  inputButton: {
    width: 150,
    height: 35,
  },
  container: {
    flex: 1,
    marginTop: 20,
  },
  item: {
    opacity: 1,
    padding: 10,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 15,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#CEDCCE',
    marginTop: 15,
  },
  loadingIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pcContainer: {
    padding: 10,
  },
  sectionHeaderContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#0000FF',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#000000',
  },
  pcCellContainer: {
    backgroundColor: '#ffffff',
    padding: 5,
  },
  cellTitle: {
    fontSize: 20,
    color: '#000000',
  },
  cellSubtitle: {
    fontSize: 15,
    color: '#808080',
  },
  alertContainer: {
    borderWidth: 1,
    borderRadius: 3,
    flex: 0.25,
    backgroundColor: '#3399ff',
  },
  scopeContainer: {
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  subscribedScopeButton: {
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderRadius: 15,
    padding: 10,
  },
  unsubscribedScopeButton: {
    alignItems: 'center',
    backgroundColor: '#FD959A',
    borderRadius: 15,
    padding: 10,
  },
  scopeText: {
    color: 'white',
    fontSize: 12,
    alignSelf: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  chipText: {
    color: '#000000',
    marginRight: 8,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
  },
  dash: {
    width: 6,
    height: 1,
    backgroundColor: 'white',
  },
  roundedView: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  enablePushButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  enablePushRowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enablePushButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  warningTitleText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  warningBodyText: {
    color: '#E0E0E0',
  },
  warningView: {
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#F1084F',
    marginBottom: 8,
  }
});
