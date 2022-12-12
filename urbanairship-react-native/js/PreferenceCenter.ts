/* Copyright Airship and Contributors */

'use strict';

import { SubscriptionScope } from './UrbanAirship'
import { JsonValue } from "./Json";

// ---
// See: https://github.com/urbanairship/web-push-sdk/blob/master/src/remote-data/preference-center.ts
// ---

/**
 * A preference center definition.
 *
 * @typedef {object} PreferenceCenter
 * @property {string} id the ID of the preference center
 * @property {Array<PreferenceCenter.CommonSection>} sections a list of sections
 * @property {?CommonDisplay} display display information
 */
export type PreferenceCenter = {
  id: string
  sections: Section[]
  display?: CommonDisplay
}

/**
 * Preference center display information.
 * @typedef {object} CommonDisplay
 * @property {string} name
 * @property {?string} description
 */
export type CommonDisplay = {
  name: string
  description?: string
}

export type Icon = {
  icon: string
}

export type IconDisplay = CommonDisplay & Partial<Icon>

export interface ItemBase {
  type: unknown
  id: string
  display: CommonDisplay
  conditions?: Condition[]
}

/**
 * A channel subscription item.
 * @typedef {object} ChannelSubscriptionItem
 * @memberof PreferenceCenter
 * @property {"channel_subscription"} type
 * @property {string} id the item identifier
 * @property {?CommonDisplay} display display information
 * @property {string} subscription_id the subscription list id
 */
export interface ChannelSubscriptionItem extends ItemBase {
  type: 'channel_subscription'
  subscription_id: string
}

export interface ContactSubscriptionGroupItem extends ItemBase {
  type: 'contact_subscription_group'
  id: string
  subscription_id: string
  components: ContactSubscriptionGroupItemComponent[]
}

export interface ContactSubscriptionGroupItemComponent {
  scopes: SubscriptionScope[]
  display: Omit<CommonDisplay, 'description'>
}

export interface ContactSubscriptionItem extends ItemBase {
  type: 'contact_subscription'
  scopes: SubscriptionScope[]
  subscription_id: string
}

export interface AlertItem extends ItemBase {
  type: 'alert'
  display: IconDisplay
  button?: Button
}

export interface ConditionBase {
  type: unknown
}

export interface NotificationOptInCondition extends ConditionBase {
  type: 'notification_opt_in'
  when_status: 'opt_in' | 'opt_out'
}

export type Condition = NotificationOptInCondition

// Changed from `unknown` in spec
export type Actions = {
  [key: string]: JsonValue;
};

export interface Button {
  text: string
  content_description?: string
  actions: Actions
}

export interface SectionBase {
  type: unknown
  id: string
  display?: CommonDisplay
  items: Item[]
}

/**
 * @typedef {object} CommonSection
 * @memberof PreferenceCenter
 * @property {"section"} type
 * @property {string} id the section identifier
 * @property {?CommonDisplay} display display information
 * @property {Array<PreferenceCenter.ChannelSubscriptionItem>} items list of
 *   section items
 */
export interface CommonSection extends SectionBase {
  type: 'section'
}

export interface LabeledSectionBreak extends SectionBase {
  type: 'labeled_section_break'
  items: never
}

export type Item =
  | ChannelSubscriptionItem
  | ContactSubscriptionGroupItem
  | ContactSubscriptionItem
  | AlertItem

export type Section = CommonSection | LabeledSectionBreak
