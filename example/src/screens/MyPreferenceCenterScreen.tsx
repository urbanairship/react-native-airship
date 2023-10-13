import React, {useEffect, useRef} from 'react';
import {
  PixelRatio,
  View,
  UIManager,
  findNodeHandle,
} from 'react-native';

import styles from './../Styles';

import { ReactPreferenceCenterViewManager } from '@ua/react-native-airship';

const createFragment = viewId =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    UIManager.ReactPreferenceCenterViewManager.Commands.create.toString(),
    [viewId],
  );

export const MyView = () => {
  const ref = useRef(null);

  useEffect(() => {
    const viewId = findNodeHandle(ref.current);
    if (viewId == null) {
        console.log("viewID = null")
    } else {
        console.log("viewID OK")
    }
    createFragment(viewId);
  }, []);

  return (
    //<View style={styles.pcContainer}>
        <ReactPreferenceCenterViewManager
        style={{
            // converts dpi to px, provide desired height
            height: PixelRatio.getPixelSizeForLayoutSize(200),
            // converts dpi to px, provide desired width
            width: PixelRatio.getPixelSizeForLayoutSize(200),
        }}
        ref={ref}
        />
    //</View>
  );
};