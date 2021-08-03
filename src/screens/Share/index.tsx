import React from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';

function Share(): JSX.Element {
  return <View>
    <Text>Share Screen</Text>
  </View>
}
const mapStateToProps = (state: any) => {
  return { ...state }
};

export default connect(mapStateToProps)(Share);
