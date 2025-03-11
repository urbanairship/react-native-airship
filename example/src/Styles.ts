import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backgroundIcon: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  enablePushButtonContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  enablePushRowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roundedView: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 12,
  },
  warningView: {
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    padding: 16,
    marginVertical: 8,
  },
  warningTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningBodyText: {
    fontSize: 14,
  },
});