import React, { useEffect, useState } from 'react';
import prettysize from 'prettysize';
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  Platform, BackHandler, TouchableOpacity, TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';
import ProgressBar from '../../components/ProgressBar';
import { getIcon } from '../../helpers/getIcon';
import PlanCard from './PlanCard';
import { IPlan, IProduct, storageService } from '../../redux/services';
import { Reducers } from '../../redux/reducers/reducers';
import { loadValues } from '../../modals';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import strings from '../../../assets/lang/strings';
import AppMenu from '../../components/AppMenu';
import { tailwind } from '../../helpers/designSystem';

interface StorageProps extends Reducers {
  currentPlan: number
}

function Storage(props: StorageProps): JSX.Element {
  const [usageValues, setUsageValues] = useState({ usage: 0, limit: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<IProduct[]>([])
  const [plans, setPlans] = useState<IPlan[]>([])
  const [chosenProduct, setChosenProduct] = useState<IProduct>()

  const getProducts = async () => {
    const products = await storageService.loadAvailableProducts()

    return products
  }

  const getPlans = async (product: IProduct) => {
    const plans = await storageService.loadAvailablePlans(product.id)

    return plans
  }

  // BackHandler
  const backAction = () => {
    if (!chosenProduct) {
      props.navigation.replace('FileExplorer')
    } else {
      setChosenProduct(undefined)
    }
    return true
  }

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

  useEffect(() => {
    loadValues().then(res => {
      setUsageValues(res)
    }).catch(() => { })

    getProducts().then((res) => {
      setProducts(res)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (chosenProduct) {
      getPlans(chosenProduct).then(res => {
        setPlans(res)
        setIsLoading(false)
      })
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

    return () => backHandler.remove()
  }, [chosenProduct])

  return (
    <View style={styles.bgWhite}>
      <AppMenu {...props} title={strings.screens.storage.title} hideSearch={true} hideOptions={true} />
      <View>
        <View>
          <Text>Usage</Text>
        </View>
        <View style={[tailwind('mx-5 px-5 py-3'), { backgroundColor: '#F4F5F7', borderRadius: 10 }]}>
          <View>
            <Text>{strings.screens.storage.space.used.used} {prettysize(usageValues.usage)} {strings.screens.storage.space.used.of} {putLimitUsage()}</Text>
          </View>
          <View style={[tailwind('my-2'), {}]}>
            <ProgressBar
              styleProgress={styles.h7}
              totalValue={usageValues.limit}
              usedValue={usageValues.usage}
            />
          </View>
        </View>
      </View>

      <View>
        <View>
          <Text>Current plan</Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.cardsContainer}>
          {
            !isLoading ?
              !chosenProduct ?
                <View>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>{strings.screens.storage.plans.title}</Text>
                  </View>
                  {
                    products && products.map((product: IProduct) => <TouchableWithoutFeedback
                      key={product.id}
                      onPress={async () => {
                        setIsLoading(true)
                        setChosenProduct(product)
                      }}>
                      <PlanCard
                        currentPlan={prettysize(usageValues.limit)}
                        product={product}
                        size={product.metadata.simple_name}
                        price={product.metadata.price_eur} />
                    </TouchableWithoutFeedback>)
                  }
                </View>
                :
                <View>
                  {
                    !isLoading ?
                      <View>
                        <View style={styles.titleContainer}>
                          <TouchableOpacity
                            onPress={() => {
                              setChosenProduct(undefined)
                            }}
                            style={styles.paymentBack}
                          >
                            <Image style={styles.paymentBackIcon} source={getIcon('back')} />
                          </TouchableOpacity>

                          <Text style={styles.title}>{strings.screens.storage.plans.title_2}</Text>

                          <Text style={styles.titlePlan}>{chosenProduct.name}</Text>
                        </View>

                        {
                          plans && plans.map((plan: IPlan) => <TouchableWithoutFeedback
                            key={plan.id}
                            onPress={() => props.navigation.replace('StorageWebView', { plan: plan })}
                          >
                            <PlanCard chosen={true} price={plan.price.toString()} plan={plan} />
                          </TouchableWithoutFeedback>)
                        }
                      </View>
                      :
                      null
                  }
                </View>
              :
              <View>
                <ActivityIndicator color={'gray'} />
              </View>
          }
          <View>
            <Text style={styles.footer}>{strings.screens.storage.plans.current_plan} {prettysize(usageValues.limit)} {strings.getLanguage() === 'es' ? null : 'plan'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    flexGrow: 1,
    marginLeft: 20,
    paddingTop: 20
  },
  container: {
    backgroundColor: 'white',
    height: '100%',
    justifyContent: 'flex-start'
  },
  footer: {
    color: '#7e848c',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 16,
    letterSpacing: -0.1,
    lineHeight: 22,
    marginLeft: 0,
    marginTop: 20
  },
  paymentBack: {
    alignItems: 'center',
    height: wp('6'),
    justifyContent: 'center',
    width: wp('6')
  },
  paymentBackIcon: {
    height: 13,
    marginRight: 10,
    width: 8
  },
  title: {
    color: 'black',
    fontFamily: 'NeueEinstellung-Bold',
    fontSize: 18,
    letterSpacing: 0,
    marginRight: 10,
    paddingBottom: Platform.OS === 'android' ? wp('1') : 0,
    textAlignVertical: 'center'
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12
  },
  titlePlan: {
    borderColor: '#eaeced',
    borderLeftWidth: 1,
    color: '#7e848c',
    fontFamily: 'NeueEinstellung-Medium',
    fontSize: 18,
    paddingBottom: Platform.OS === 'android' ? wp('1') : 0,
    paddingLeft: 10
  },
  bgWhite: {
    backgroundColor: '#fff'
  },
  h7: { height: 7 }
})

const mapStateToProps = (state: any) => {
  return { ...state }
};

export default connect(mapStateToProps)(Storage)