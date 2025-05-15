import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import React, { useState } from 'react';
import WebView from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { GetSubscriptionStatus } from '../utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PaymentRouteParams = {
  params: {
    url: string;
    session: string;
  };
};

const Payment = () => {
  const route = useRoute<RouteProp<PaymentRouteParams, 'params'>>();
  const { url, session } = route.params;
  const navigation = useNavigation();
  console.log(url);
  

  const [hasReachedSuccessUrl, setHasReachedSuccessUrl] = useState(false);
  const [finalRedirectUrl, setFinalRedirectUrl] = useState<string | null>(null);

  const successUrl = `http://localhost:5173/success?session_id=${session}`;

  const handleNavigationChange = async(navState:{url:string}) => {
    const currentUrl = navState.url;

    if(currentUrl.includes('success')) {
      console.log('Success URL reached:', currentUrl);
      try{
        const response = await GetSubscriptionStatus(session);
        const userString = await AsyncStorage.getItem('user');
        if(userString){
          const user = JSON.parse(userString);
          user.premiumSubscribed = true;
          await AsyncStorage.setItem("user",JSON.stringify(user));
          console.log('Premium subcription activated');
          navigation.replace("HomePage")
        }else if(!userString){
          console.error("No user data found in AsyncStorage");
          Alert.alert('Error', 'User data not found. Please log in again.');
          return;
        }else{
          console.error('Failed to fetch subscription status:', response);
          Alert.alert('Error', 'Payment verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        Alert.alert('Error', 'An error occurred while verifying your payment.');
      }
    }
    else if (currentUrl.includes('cancel')) {
      console.log('Payment cancelled:', currentUrl);
      Alert.alert('Payment Cancelled', 'Your payment was cancelled.');
      navigation.navigate('HomePage');
    }
  };

  //    else if (hasReachedSuccessUrl && !finalRedirectUrl) {
  //     setFinalRedirectUrl(currentUrl);
  //     console.log('Final redirected URL after success:', currentUrl);
      
  //     navigation.replace('Homepage'); 
  //   }
  // };

  return (
    <SafeAreaView style={{ flex: 1 }} testID="payment-screen">
      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        onNavigationStateChange={handleNavigationChange}
      />
    </SafeAreaView>
  );
};

export default Payment;