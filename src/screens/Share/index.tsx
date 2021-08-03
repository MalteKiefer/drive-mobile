import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux';
import { Reducers } from '../../redux/reducers/reducers';
import AppMenu from '../../components/AppMenu';
import { WaveIndicator } from 'react-native-indicators';

function Share(props: Reducers): JSX.Element {
  const [loading, setLoading] = useState(true);

  return <View style={styles.container}>
    <AppMenu title="Share" />
    <Text>{loading ? <View style={styles.activityIndicator}>
      <WaveIndicator color="#5291ff" size={80} />
    </View>
      : 'aaa'}</Text>
  </View>
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 1
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center'
  }
});

const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(Share)