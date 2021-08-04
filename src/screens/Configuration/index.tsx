import React from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';

function Configuration(): JSX.Element {
  return <View>
    <Text>Settings Screen</Text>
  </View>
}
const mapStateToProps = (state: any) => {
  return { ...state }
};

export default connect(mapStateToProps)(Configuration);
