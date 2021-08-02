import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Linking, ActivityIndicator, Alert } from 'react-native';
import Modal from 'react-native-modalbox'
import ProgressBar from '../../components/ProgressBar';
import { layoutActions, userActions } from '../../redux/actions';
import SettingsItem from './SettingsItem';
import prettysize from 'prettysize'
import Separator from '../../components/Separator';
import { connect } from 'react-redux';
import { getHeaders } from '../../helpers/headers';
import analytics, { getLyticsUuid } from '../../helpers/lytics';
import Bold from '../../components/Bold';
import { Dispatch } from 'redux';
import { LayoutState } from '../../redux/reducers/layout.reducer';
import strings from '../../../assets/lang/strings';

function identifyPlanName(bytes: number): string {
  return bytes === 0 ? 'Free 10GB' : prettysize(bytes)
}

async function loadUsage(): Promise<number> {
  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/usage`, {
    method: 'get',
    headers: await getHeaders()
  }).then(res => {
    if (res.status !== 200) { throw Error('Cannot load usage') }
    return res
  }).then(res => res.json()).then(res => { return res.total; })
}

async function loadLimit(): Promise<number> {
  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/limit`, {
    method: 'get',
    headers: await getHeaders()
  }).then(res => {
    if (res.status !== 200) { throw Error('Cannot load limit') }
    return res
  }).then(res => res.json()).then(res => { return res.maxSpaceBytes })
}

export async function loadValues(): Promise<{ usage: number, limit: number }> {
  const limit = await loadLimit()
  const usage = await loadUsage()

  const uuid = await getLyticsUuid()

  analytics.identify(uuid, {
    platform: 'mobile',
    storage: usage,
    plan: identifyPlanName(limit),
    userId: uuid
  }).catch(() => { })

  return { usage, limit }
}
interface SettingsModalProps {
  user: any
  layoutState: LayoutState
  dispatch: Dispatch,
  navigation: any
}

function SettingsModal(props: SettingsModalProps) {

  const [usageValues, setUsageValues] = useState({ usage: 0, limit: 0 })
  const [isLoadingUsage, setIsLoadingUpdate] = useState(false)

  useEffect(() => {
    if (props.layoutState.showSettingsModal) {
      setIsLoadingUpdate(true)
      loadValues().then(values => {
        setUsageValues(values)
      }).catch(() => { })
        .finally(() => {
          setIsLoadingUpdate(false)
        })
    }
  }, [props.layoutState.showSettingsModal])

  const putLimitUsage = () => {
    if (usageValues.limit > 0) {
      if (usageValues.limit < 108851651149824) {
        return prettysize(usageValues.limit);
      } else if (usageValues.limit >= 108851651149824) {
        return '\u221E';
      } else {
        return '...';
      }
    }
  }

  return (
    <Modal
      isOpen={props.layoutState.showSettingsModal}
      position={'bottom'}
      entry={'bottom'}
      coverScreen={false}
      swipeThreshold={40}
      swipeToClose={true}
      style={styles.modalSettings}
      onClosed={() => {
        props.dispatch(layoutActions.closeSettings())
      }}
      backButtonClose={true}
      animationDuration={200}>

      <View style={styles.drawerKnob}></View>

      <Text style={styles.nameText}>
        {props.user.name}{' '}
        {props.user.lastname}
      </Text>

      <ProgressBar
        styleProgress={styles.progressHeight}
        totalValue={usageValues.limit}
        usedValue={usageValues.usage}
      />

      {isLoadingUsage ?
        <ActivityIndicator color={'#00f'} />
        :
        <Text style={styles.usageText}>
          <Text>{strings.screens.storage.space.used.used} </Text>
          <Bold>{prettysize(usageValues.usage)}</Bold>
          <Text> {strings.screens.storage.space.used.of} </Text>
          <Bold>{putLimitUsage()}</Bold>
        </Text>
      }

      <Separator />

      <SettingsItem
        text={strings.components.app_menu.settings.storage}
        onPress={() => {
          props.dispatch(layoutActions.closeSettings())
          props.navigation.replace('Storage')
        }}
      />

      <SettingsItem
        text={strings.components.app_menu.settings.more}
        onPress={() => Linking.openURL('https://internxt.com/drive')}
      />

      <SettingsItem
        text={strings.components.app_menu.settings.contact}
        onPress={() => {
          const contact = 'https://help.internxt.com/'

          Linking.canOpenURL(contact).then(() => {
            Linking.openURL(contact)
          }).catch(() => {
            Alert.alert('Info', 'To contact with us please go to https://help.internxt.com/')
          })
        }}
      />

      <SettingsItem
        text={strings.components.app_menu.settings.sign}
        onPress={() => {
          props.dispatch(layoutActions.closeSettings())
          props.dispatch(userActions.signout())
        }}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalSettings: {
    borderWidth: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32
  },
  drawerKnob: {
    alignSelf: 'center',
    backgroundColor: '#0F62FE',
    borderRadius: 4,
    height: 4,
    margin: 12,
    width: 50
  },
  nameText: {
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 26,
    marginTop: 10
  },
  progressHeight: {
    height: 6
  },
  usageText: {
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 15,
    paddingBottom: 0,
    paddingLeft: 24
  }
})

const mapStateToProps = (state: any) => {
  return {
    user: state.authenticationState.user,
    layoutState: state.layoutState
  };
};

export default connect(mapStateToProps)(SettingsModal);
