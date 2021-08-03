import React from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';

function Recents(): JSX.Element {
  return <View>
    <Text>Recents Screen</Text>
  </View>
}
const mapStateToProps = (state: any) => {
  return { ...state }
};

export default connect(mapStateToProps)(Recents);
