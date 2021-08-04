import React, { Fragment, useState, useRef } from 'react'
import { View, StyleSheet, TextInput, Text, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux';
import { fileActions, layoutActions } from '../../redux/actions';
import * as Unicons from '@iconscout/react-native-unicons';
import { Reducers } from '../../redux/reducers/reducers';

interface AppMenuProps extends Reducers {
  title: string
}

function AppMenu(props: AppMenuProps) {
  const [activeSearchBox, setActiveSearchBox] = useState(false)
  const selectedItems = props.filesState.selectedItems;
  const textInput = useRef<TextInput>(null)

  const parentFolderId = props?.filesState?.folderContent?.parentId;

  return <View style={styles.container}>

    <Fragment>
      <View style={styles.buttonContainer}>
        <View style={styles.commonButtons}>
          <View style={styles.w50}>
            <TouchableWithoutFeedback onPress={() => {
              props.dispatch(fileActions.getFolderContent(parentFolderId));
            }}>
              <Unicons.UilArrowLeft color={parentFolderId ? '#0F62FE' : '#EBECF0'} size={27} />
            </TouchableWithoutFeedback>
          </View>
          <View>
            <Text style={styles.storageText}>{props.title}</Text>
          </View>
          <View style={styles.openSearchIcon}>
            <TouchableWithoutFeedback onPress={() => {
              props.dispatch(layoutActions.openSearch())
            }}>
              <Unicons.UilSearch color='#0F62FE' size={27} />
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                props.dispatch(layoutActions.openSettings());
              }}>
              <Unicons.UilEllipsisV color='#0F62FE' size={27} />
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    </Fragment>
  </View>
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 17,
    marginRight: 10
  },
  commonButtons: {
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  container: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  storageText: {
    fontFamily: 'NeueEinstellung-SemiBold',
    fontSize: 24,
    color: '#42526E'
  },
  openSearchIcon: {
    width: 70,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  w50: { width: 50 }
});

const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(AppMenu)