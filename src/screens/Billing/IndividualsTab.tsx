import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, TouchableHighlight, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import Accordion from 'react-native-collapsible/Accordion';
import * as Unicons from '@iconscout/react-native-unicons';
import { tailwind } from '../../helpers/designSystem';

const SECTIONS = [
  {
    title: 'Starter 20GB',
    size: '20GB',
    content: {
      subscriptions: [
        {
          name: 'Monthly',
          price: '0.99'
        },
        {
          name: 'Semiannually',
          price: '0.95'
        },
        {
          name: 'Annually',
          price: '0.89'
        }
      ]
    }
  },
  {
    title: 'Starter 200GB',
    size: '200GB',
    content: {
      subscriptions: [
        {
          name: 'Monthly',
          price: '4.49'
        },
        {
          name: 'Semianually',
          price: '3.99'
        },
        {
          name: 'Annually',
          price: '3.49'
        }
      ]
    }
  },
  {
    title: 'Starter 2TB',
    size: '2TB',
    content: {
      subscriptions: [
        {
          name: 'Monthly',
          price: '9.99'
        },
        {
          name: 'Semiannually',
          price: '9.49'
        },
        {
          name: 'Annually',
          price: '8.99'
        }
      ]
    }
  }
];

const _renderHeader = (section) => {
  return (
    <View style={{
      backgroundColor: 'white', flexDirection: 'row',
      alignItems: 'center', padding: 10,
      borderBottomWidth: 1, borderColor: '#ccc'
    }}>
      <View style={{ flexGrow: 1 }}>
        <Text style={{ fontSize: 15, padding: 10 }}>{section.title}</Text>
      </View>

      <View>
        <Unicons.UilAngleDown color="gray" />
      </View>

    </View>
  );
};

function IndividualsTab(props: any) {
  const [activeSections, setActiveSections] = useState<number[]>([]);
  const [period, setPeriod] = useState('');

  const _renderContent = (section, index) => {
    return (
      <View style={{ backgroundColor: 'white', padding: 15 }}>

        <View style={styles.container}>
          <View>
            <Text style={styles.title}>{section.size}</Text>
          </View>
          <View>
            <Text style={styles.subTitle}>{section.size}</Text>
          </View>
          {section.content.subscriptions.map((item, i) => (
            <TouchableWithoutFeedback
              key={i}
              onPress={() => setPeriod(item.name)}
            >
              <View key={i} style={[styles.periodBox, item.name === period ? { borderColor: '#0F62FE' } : { borderColor: '#C1C7D0' }]}>
                <View style={{ flexGrow: 1 }}>
                  <Text style={styles.periodText}>{item.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.price}>{item.price}</Text>
                  <Text style={styles.month}>/month</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          ))}
          <View>
            <Text style={styles.subTitle}>Everything in this plan</Text>
          </View>

          <View style={styles.featureContainer}>
            <Unicons.UilCheck size={16} color="#0F62FE" /><Text style={styles.feature}>All available devices</Text>
          </View>

          <View style={styles.featureContainer}>
            <Unicons.UilCheck size={16} color="#0F62FE" /><Text style={styles.feature}>Unlimited devices</Text>
          </View>

          <View style={styles.featureContainer}>
            <Unicons.UilCheck size={16} color="#0F62FE" /><Text style={styles.feature}>Secure file storing</Text>
          </View>
          <TouchableHighlight
            style={[styles.paymentButton, { backgroundColor: '#A6C8FF' }]}
            underlayColor="#4585f5"
          >
            <Text style={tailwind('text-base btn-label')}>Choose your payment</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  };

  return <View style={{ backgroundColor: 'white', flex: 1 }}>
    <ScrollView>
      <Accordion
        sections={SECTIONS}
        activeSections={activeSections}
        renderHeader={_renderHeader}
        renderContent={_renderContent.bind(this)}
        onChange={setActiveSections}
      />
    </ScrollView>
  </View>
}
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: 'NeueEinstellung-Bold',
    color: '#253858',
    paddingBottom: 8
  },
  subTitle: {
    color: '#253858',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 8
  },
  container: {
    flexDirection: 'column',
    marginHorizontal: 10
  },
  periodBox: {
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    marginVertical: 5
  },
  periodText: {
    color: '#42526E',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 16
  },
  price: {
    fontSize: 16,
    fontFamily: 'NeueEinstellung-Bold',
    marginHorizontal: 8
  },
  month: {
    fontSize: 10
  },
  feature: {
    color: '#253858',
    fontSize: 14
  },
  featureContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  paymentButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginVertical: 20,
    borderRadius: 5
  }
});

const mapStateToProps = (state: any) => ({ ...state });

export default connect(mapStateToProps)(IndividualsTab);