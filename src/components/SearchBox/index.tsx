import React, { Fragment } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import * as Unicons from '@iconscout/react-native-unicons'
import { connect } from 'react-redux';
import { layoutActions } from '../../redux/actions';

function SearchBox(props: any): JSX.Element {
  return <Fragment>
    <View style={styles.container}>
      <View style={styles.textInputWrapper}>
        <View style={styles.searchIcon}>
          <Unicons.UilSearch color="#42526E" size={20} />
        </View>
        <TextInput style={styles.textInput} placeholder="Search" />
      </View>
      <View>
        <TouchableWithoutFeedback
          onPress={() => {
            props.dispatch(layoutActions.closeSearch())
          }}
          style={styles.cancelWrapper}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableWithoutFeedback>
      </View>
    </View>
  </Fragment>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 24,
    marginRight: 24
  },
  textInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F7',
    borderRadius: 6,
    flexGrow: 1
  },
  textInput: {

  },
  cancelWrapper: {
  },
  cancelText: {
    color: '#0F62FE',
    padding: 10
  },
  searchIcon: {
    margin: 16
  }
});

const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(SearchBox)
