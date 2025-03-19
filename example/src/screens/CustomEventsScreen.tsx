/* Copyright Airship and Contributors */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import styles from '../Styles';
import Airship from '@ua/react-native-airship';
type CustomEventsScreenProps = {
  navigation: any;
};

export default function CustomEventsScreen({ navigation }: CustomEventsScreenProps) {
  const [eventName, setEventName] = useState('');
  const [eventValue, setEventValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventProperties, setEventProperties] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ]);

  const addPropertyField = () => {
    setEventProperties([...eventProperties, { key: '', value: '' }]);
  };

  const updatePropertyKey = (text: string, index: number) => {
    const updatedProperties = [...eventProperties];
    updatedProperties[index].key = text;
    setEventProperties(updatedProperties);
  };

  const updatePropertyValue = (text: string, index: number) => {
    const updatedProperties = [...eventProperties];
    updatedProperties[index].value = text;
    setEventProperties(updatedProperties);
  };

  const removeProperty = (index: number) => {
    const updatedProperties = [...eventProperties];
    updatedProperties.splice(index, 1);
    setEventProperties(updatedProperties);
  };

  const sendCustomEvent = async () => {
    if (!eventName) {
      Alert.alert('Error', 'Event name is required');
      return;
    }

    setLoading(true);

    try {
      // Build properties object
      const properties: Record<string, string> = {};
      eventProperties.forEach((prop) => {
        if (prop.key && prop.value) {
          properties[prop.key] = prop.value;
        }
      });

      // Convert event value to number if needed
      const value = eventValue ? parseFloat(eventValue) : undefined;

      // Send the custom event
      await Airship.analytics.addCustomEvent({
        eventName: eventName,
        eventValue: value,
        properties: Object.keys(properties).length > 0 ? properties : undefined,
      });

      Alert.alert('Success', 'Custom event sent successfully');

      // Reset form
      setEventName('');
      setEventValue('');
      setEventProperties([{ key: '', value: '' }]);
    } catch (error) {
      Alert.alert('Error', `Failed to send custom event: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView style={styles.container}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#004BFF" />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Custom Events</Text>
            <Text style={styles.sectionSubtitle}>
              Send custom events to track user behavior and trigger automations
            </Text>
          </View>

          {/* Event Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. product_viewed"
              value={eventName}
              onChangeText={setEventName}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Event Value */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Value (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 99.99"
              keyboardType="numeric"
              value={eventValue}
              onChangeText={setEventValue}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Event Properties */}
          <View style={styles.inputGroup}>
            <View style={styles.propertiesHeader}>
              <Text style={styles.label}>Event Properties (optional)</Text>
              <TouchableOpacity style={styles.addButton} onPress={addPropertyField}>
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {eventProperties.map((property, index) => (
              <View key={index} style={styles.propertyRow}>
                <TextInput
                  style={[styles.textInput, styles.propertyKey]}
                  placeholder="Key"
                  value={property.key}
                  onChangeText={(text) => updatePropertyKey(text, index)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TextInput
                  style={[styles.textInput, styles.propertyValue]}
                  placeholder="Value"
                  value={property.value}
                  onChangeText={(text) => updatePropertyValue(text, index)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {eventProperties.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeProperty(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Send Button */}
          <TouchableOpacity style={styles.sendButton} onPress={sendCustomEvent}>
            <Text style={styles.sendButtonText}>Send Custom Event</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Event Examples</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesContainer}>
            <TouchableOpacity
              style={styles.exampleCard}
              onPress={() => {
                setEventName('product_viewed');
                setEventValue('29.99');
                setEventProperties([
                  { key: 'product_id', value: 'ABC123' },
                  { key: 'category', value: 'electronics' },
                  { key: 'color', value: 'black' },
                ]);
              }}
            >
              <Text style={styles.exampleTitle}>Product View</Text>
              <Text style={styles.exampleDescription}>
                Track when users view a product
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exampleCard}
              onPress={() => {
                setEventName('cart_add');
                setEventValue('59.99');
                setEventProperties([
                  { key: 'product_id', value: 'XYZ789' },
                  { key: 'quantity', value: '2' },
                ]);
              }}
            >
              <Text style={styles.exampleTitle}>Add to Cart</Text>
              <Text style={styles.exampleDescription}>
                Track when users add items to cart
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exampleCard}
              onPress={() => {
                setEventName('purchase');
                setEventValue('129.99');
                setEventProperties([
                  { key: 'order_id', value: 'ORDER12345' },
                  { key: 'items', value: '3' },
                ]);
              }}
            >
              <Text style={styles.exampleTitle}>Purchase</Text>
              <Text style={styles.exampleDescription}>
                Track completed purchases
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

