import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import IconFolder from '../../components/IconFolder';
import Icon from '../../../assets/icons/Icon';
import { colors } from '../../redux/constants';
import { fileActions } from '../../redux/actions';
import { getLyticsData } from '../../helpers';
import analytics from '../../helpers/lytics';
import { Reducers } from '../../redux/reducers/reducers';

interface FolderProps extends Reducers {
    isFolder: boolean
    item: any
    isLoading?: boolean
}

function Folder(props: FolderProps) {
  const item = props.item

  async function handleClick(props: any) {
    const userData = await getLyticsData()

    analytics.track('folder-opened', {
      userId: userData.uuid,
      email: userData.email,
      // eslint-disable-next-line camelcase
      folder_id: props.item.id
    })
    props.dispatch(fileActions.getFolderContent(props.item.id))
  }

  return (
    <View style={styles.container}>
      <View style={styles.fileDetails}>
        <TouchableWithoutFeedback
          style={styles.touchableItemArea}
          onPress={() => {
            handleClick(props)
          }}>

          <View style={styles.itemIcon}>
            <IconFolder color={props.item.color} />

            {
              props.item.icon ?

                <View style={styles.icon}>
                  <Icon
                    name={props.item.icon.name}
                    color={item.color ? colors[item.color].icon : colors['blue'].icon}
                    width={24}
                    height={24}
                  />
                </View>
                : null
            }
          </View>

          <View style={styles.nameAndTime}>
            <Text
              style={styles.fileName}
              numberOfLines={1}
            >{props.item.name}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e6e6e6',
    flexDirection: 'row',
    height: 80
  },
  fileDetails: {
    flexGrow: 1
  },
  fileName: {
    color: '#000000',
    fontFamily: 'NeueEinstellung-Bold',
    fontSize: 16,
    letterSpacing: -0.1
  },
  icon: {
    left: 35,
    position: 'absolute',
    top: 7
  },
  itemIcon: {
  },
  nameAndTime: {
    flexDirection: 'column',
    width: 230
  },
  touchableItemArea: {
    alignItems: 'center',
    flexDirection: 'row'
  }
});

const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(Folder);