/* Copyright Airship and Contributors */

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backgroundIcon: {
    width: '100%',
    resizeMode: 'contain',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    marginLeft: 10,
  },
  managerCell: {
    flex: 0,
    flexDirection: 'row',
    padding: 10,
  },
  channel: {
    fontSize: 16,
    color: '#0d6a83',
    textAlign: 'center',
    padding: 10,
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
    color: '#0d6a83',
    alignSelf: 'flex-start',
    width: 100,
    flexDirection: 'row',
    height: 35,
    borderColor: 'white',
    borderWidth: 1,
  },
  inputButton: {
    width: 150,
    height: 35,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    backgroundColor: '#0d6a83',
  },
  dash: {
    backgroundColor: 'white',
    height: 2,
    width: 10,
    position: 'absolute',
    left: 5,
    top: 8.5,
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
});
