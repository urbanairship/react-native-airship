import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { View, Text, Switch } from 'react-native';

class AlertItem extends Component {
  render() {
    return (
        <View style={{flexDirection: "row"}}>
            <View style={{
                borderColor: '#aaaaaa',
                borderWidth: 1,
                borderRadius: 3,
                flex: 0.25,
                backgroundColor: '#aaaaaa',
            }}>
                <Text>{this.props.name}</Text>
                <Text>{this.props.description}</Text>
            </View>
        </View>
    );
  }
}

class ChanneSubscriptionItem extends Component {
  render() {
    return (
          <View style={{flexDirection: "row"}}>
            <View style={{ flex: 0.99 }}>
              <Text>{this.props.name}</Text>
              <Text>{this.props.description}</Text>
            </View>
            <Switch
                trackColor={{ true: "#0d6a83", false: null }}
                //onValueChange={(value) => this.onPreferenceChannelItemToggled(this.props.subscriptionId, value)}
                //value={this.isSubscribedChannelSubscription(this.props.subscriptionId)}
            />
          </View>
    );
  }
}

class ContactSubscriptionGroupItem extends Component {
  render() {
    return (
          <View style={{flexDirection: "row"}}>
            <View style={{ flex: 0.99 }}>
              <Text>{this.props.name}</Text>
              <Text>{this.props.description}</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              //thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              //onValueChange={toggleSwitch}
              //value={isEnabled}
             />
          </View>
    );
  }
}

class ContactSubscriptionItem extends Component {

  render() {
    return (
          <View style={{flexDirection: "row"}}>
            <View style={{ flex: 0.99 }}>
              <Text>{this.props.name}</Text>
              <Text>{this.props.description}</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              //thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              //onValueChange={toggleSwitch}
              //value={isEnabled}
             />
          </View>
    );
  }
}



const PreferenceCell = props => {
  const style = {
    borderColor: '#aaaaaa',
    borderWidth: 1,
    borderRadius: 3,
    flex: 1,
  };

  if (props.data.backgroundColor !== undefined) {
    style.backgroundColor = props.data.backgroundColor;
  }

  return (
//    <AlertItem
//        name={props.data.label}
//        description={props.data.message}
//    />
    <ChanneSubscriptionItem
        name={props.data.name}
        description={props.data.description}
        subscriptionId={props.data.subscriptionId}
    />
  );
};

PreferenceCell.propTypes = {
  data: PropTypes.object,
  section: PropTypes.number,
  row: PropTypes.number,
};

PreferenceCell.defaultProps = {
  data: null,
  section: null,
  row: null,
};

export default PreferenceCell;