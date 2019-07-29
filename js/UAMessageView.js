/* Copyright Airship and Contributors */

// @flow
'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import {
  ReactNative,
  requireNativeComponent,
  UIManager
} from 'react-native';

/**
 * Inbox message.
 */
class UAMessageView extends React.Component {
  _onLoadStarted = (event) => {
    if (!this.props.onLoadStarted) {
      return;
    }
    this.props.onLoadStarted(event.nativeEvent);
  }

  _onLoadFinished = (event) => {
    if (!this.props.onLoadFinished) {
      return;
    }
    this.props.onLoadFinished(event.nativeEvent);
  }

  _onLoadError = (event) => {
    if (!this.props.onLoadError) {
      return;
    }
    this.props.onLoadError(event.nativeEvent);
  }


  _onClose = (event) => {
    if (!this.props.onClose) {
      return;
    }
    this.props.onClose(event.nativeEvent);
  }

  render() {
    return <UARCTMessageView
        {...this.props}
        onLoadError={this._onLoadError}
        onLoadStarted={this._onLoadStarted}
        onLoadFinished={this._onLoadFinished}
        onClose={this._onClose}
      />;
  }
}

UAMessageView.propTypes = {
  /**
   * A callback when the view starts loading a message.
   */
  onLoadStarted: PropTypes.func,

  /**
   * A callback when the view finishes loading a message.
   */
  onLoadFinished: PropTypes.func,

  /**
   * A callback when the view fails to load a message with an error.
   */
  onLoadError:  PropTypes.func,

  /**
   * The ID of a message to load.
   */
  messageId: PropTypes.string
};


var UARCTMessageView = requireNativeComponent('UARCTMessageView', UAMessageView);
module.exports = UAMessageView