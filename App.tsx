import 'react-native-gesture-handler'; 
import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import Navigation from "./src/navigation/Navigation";
import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { StripeProvider } from "@stripe/stripe-react-native";


const App = () => {
  useEffect(() => {
    requestPermissionAndroid()
  }, []);

  const requestPermissionAndroid = async () => {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // Alert.alert("Permission Granted")
      getToken();
    } else {
      Alert.alert("Permission Denied");
    }
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  const getToken = async () => {
    const token = await messaging().getToken();
    console.log("token", token);
  }

  return (
    <StripeProvider
     publishableKey="pk_test_51RMOXDRvK5MlaMo1YOyfCq0pdee6NJK1ABuIkR5WVqMRPYKuHiJInGwzMrtMRcXVNyLcqXwmHYDYgTOMdfMasZ9K00FdGYmkQe">
      <Navigation />
    </StripeProvider>
  );
};

export default App;

