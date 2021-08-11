import React from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';

function BusinessTab(props: any) {
  return <View>
    <Text>Tab 1</Text>
  </View>
}

const mapStateToProps = (state: any) => ({ ...state });

export default connect(mapStateToProps)(BusinessTab);