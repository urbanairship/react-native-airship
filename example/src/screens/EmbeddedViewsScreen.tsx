/* Copyright Airship and Contributors */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Airship, { AirshipEmbeddedView } from '@ua/react-native-airship';
import styles from '../Styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type EmbeddedViewsScreenProps = {
  navigation?: any;
};

type SizeConfig = {
  key: string;
  label: string;
  description: string;
  sizeType: string;
};

const EMBEDDED_ID = 'test';
const SCREEN_NAME = 'embedded_views_screen';

const SIZE_CONFIGS: SizeConfig[] = [
  {
    key: 'fixed',
    label: 'Fixed Height',
    description: 'height: 120',
    sizeType: 'fixed',
  },
  {
    key: 'percent',
    label: 'Percentage Width',
    description: 'width: 80%, height: 100',
    sizeType: 'percent',
  },
  {
    key: 'flex',
    label: 'Flex Grow',
    description: 'flex: 1 in 200px container',
    sizeType: 'flex',
  },
  {
    key: 'aspect',
    label: 'Aspect Ratio',
    description: 'width: 100%, aspectRatio: 16/9',
    sizeType: 'aspect',
  },
  {
    key: 'minmax',
    label: 'Min/Max Constraints',
    description: 'minHeight: 80, maxHeight: 150',
    sizeType: 'minmax',
  },
  {
    key: 'explicit',
    label: 'Full Width Explicit',
    description: `width: ${Math.round(SCREEN_WIDTH - 40)}, height: 100`,
    sizeType: 'explicit',
  },
];

export default function EmbeddedViewsScreen(_props: EmbeddedViewsScreenProps) {
  const [isEmbeddedReady, setEmbeddedReady] = useState(false);

  useEffect(() => {
    Airship.analytics.trackScreen(SCREEN_NAME);
  }, []);

  useEffect(() => {
    setEmbeddedReady(Airship.inApp.isEmbeddedReady(EMBEDDED_ID));

    const listener = Airship.inApp.addEmbeddedReadyListener(EMBEDDED_ID, (ready) => {
      setEmbeddedReady(ready);
    });

    return () => {
      listener.remove();
    };
  }, []);

  const renderSizeCard = (config: SizeConfig) => {
    return (
      <View key={config.key} style={styles.evCard}>
        <View style={styles.evCardHeader}>
          <Text style={styles.evCardTitle}>{config.label}</Text>
          <View style={[styles.evStatusBadge, isEmbeddedReady ? styles.evStatusReady : styles.evStatusPending]}>
            <Text style={styles.evStatusText}>{isEmbeddedReady ? 'Ready' : 'Pending'}</Text>
          </View>
        </View>
        <Text style={styles.evCardDescription}>
          <Text style={styles.evCodeText}>{config.description}</Text>
        </Text>

        {renderSizedView(config, isEmbeddedReady)}
      </View>
    );
  };

  const placeholderText = `No content available`;

  const renderSizedView = (config: SizeConfig, isReady: boolean) => {
    const placeholder = (
      <View style={[styles.evPlaceholder, getPlaceholderStyle(config)]}>
        <Text style={styles.evPlaceholderText}>{placeholderText}</Text>
      </View>
    );

    switch (config.sizeType) {
      case 'fixed':
        return (
          <View style={styles.evEmbeddedWrapper}>
            {isReady ? (
              <AirshipEmbeddedView
                embeddedId={EMBEDDED_ID}
                style={styles.evFixedHeight}
              />
            ) : placeholder}
          </View>
        );

      case 'percent':
        return (
          <View style={styles.evCenteredWrapper}>
            {isReady ? (
              <AirshipEmbeddedView
                embeddedId={EMBEDDED_ID}
                style={styles.evPercentWidth}
              />
            ) : (
              <View style={[styles.evPlaceholder, styles.evPercentWidth]}>
                <Text style={styles.evPlaceholderText}>{placeholderText}</Text>
              </View>
            )}
          </View>
        );

      case 'flex':
        return (
          <View style={styles.evFlexContainer}>
            <View style={styles.evFlexSidebar}>
              <Text style={styles.evSidebarText}>Side</Text>
            </View>
            {isReady ? (
              <AirshipEmbeddedView
                embeddedId={EMBEDDED_ID}
                style={styles.evFlexGrow}
              />
            ) : (
              <View style={[styles.evPlaceholder, styles.evFlexGrow]}>
                <Text style={styles.evPlaceholderText}>{placeholderText}</Text>
              </View>
            )}
          </View>
        );

      case 'aspect':
        return (
          <View style={styles.evEmbeddedWrapper}>
            {isReady ? (
              <AirshipEmbeddedView
                embeddedId={EMBEDDED_ID}
                style={styles.evAspectRatio}
              />
            ) : (
              <View style={[styles.evPlaceholder, styles.evAspectRatio]}>
                <Text style={styles.evPlaceholderText}>{placeholderText}</Text>
              </View>
            )}
          </View>
        );

      case 'minmax':
        return (
          <View style={styles.evEmbeddedWrapper}>
            {isReady ? (
              <AirshipEmbeddedView
                embeddedId={EMBEDDED_ID}
                style={styles.evMinMaxHeight}
              />
            ) : (
              <View style={[styles.evPlaceholder, styles.evMinMaxHeight]}>
                <Text style={styles.evPlaceholderText}>{placeholderText}</Text>
              </View>
            )}
          </View>
        );

      case 'explicit':
        const explicitStyle = { ...styles.evExplicitSize, width: SCREEN_WIDTH - 72 };
        return (
          <View style={styles.evEmbeddedWrapper}>
            {isReady ? (
              <AirshipEmbeddedView
                embeddedId={EMBEDDED_ID}
                style={explicitStyle}
              />
            ) : (
              <View style={[styles.evPlaceholder, explicitStyle]}>
                <Text style={styles.evPlaceholderText}>{placeholderText}</Text>
              </View>
            )}
          </View>
        );

      default:
        return placeholder;
    }
  };

  const getPlaceholderStyle = (config: SizeConfig) => {
    switch (config.sizeType) {
      case 'fixed':
        return styles.evFixedHeight;
      case 'aspect':
        return styles.evAspectRatio;
      case 'minmax':
        return styles.evMinMaxHeight;
      case 'explicit':
        return { ...styles.evExplicitSize, width: SCREEN_WIDTH - 72 };
      default:
        return { height: 100 };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.evContentContainer}>
      <View style={styles.evHeader}>
        <Text style={styles.evHeaderTitle}>Embedded Views Test</Text>
        <Text style={styles.evHeaderSubtitle}>
          Testing different sizing strategies across {Platform.OS}
        </Text>
      </View>

      <View style={styles.evInfoBox}>
        <Text style={styles.evInfoTitle}>Embedded ID: "{EMBEDDED_ID}"</Text>
        <Text style={styles.evInfoText}>
          All views below use the same embedded ID with different sizing styles.
          {Platform.OS === 'ios'
            ? ' iOS SwiftUI views respect flex and percentage layouts well.'
            : ' Android Compose views may need explicit dimensions.'}
        </Text>
      </View>

      {SIZE_CONFIGS.map(renderSizeCard)}

      <View style={styles.evFooter}>
        <Text style={styles.evFooterText}>
          Create one embedded content in Airship dashboard with ID: "{EMBEDDED_ID}"
        </Text>
      </View>
    </ScrollView>
  );
}
