/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * PreferenceScreen: Contains the preference for a choosen identifier to be displayed.
 */
'use strict';

import React, { Component } from 'react';

import {
  Text,
  View,
  ActivityIndicator,
  Switch,
  SectionList,
  TouchableHighlight,
  RefreshControl,
} from 'react-native';
import Airship, { PreferenceCenterView, SubscriptionScope } from '@ua/react-native-airship';

import styles from './../Styles';

interface PreferenceCenterProps {}

interface PreferenceCenterData {
  title: unknown;
  data: any[];
}
export default class PreferenceScreen extends Component<
  PreferenceCenterProps,
  {
    preferenceCenterId: string;
    isFetching: boolean;
    activeChannelSubscriptions: string[] | undefined;
    activeContactSubscriptions: Record<string, SubscriptionScope[]> | undefined;
    preferenceCenterData: PreferenceCenterData[];
  }
> {
  constructor(props: PreferenceCenterProps) {
    super(props);
    this.state = {
      preferenceCenterId: 'neat',
      isFetching: true,
      activeChannelSubscriptions: [],
      activeContactSubscriptions: {},
      preferenceCenterData: [],
    };
  }

  render() {
    return (
      <View style={styles.backgroundContainer}>
        <PreferenceCenterView
          preferenceCenterId={"neat"}
          // @ts-ignore
          style={{ flex: 1 }}
        />
      </View>
    );
  }
}
