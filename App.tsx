import 'react-native-gesture-handler';
import React, { useEffect } from "react";
import Navigation from "./src/navigation/Navigation";
import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { StripeProvider } from "@stripe/stripe-react-native";
import Toast from 'react-native-toast-message';
import notifee, { AndroidImportance } from '@notifee/react-native';

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
      // Alert.alert("Permission Denied");
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "Notifications are disabled",
      });
    }
  }

  useEffect(() => {
    const createChannel = async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    };
    createChannel();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher', // your app icon in android/app/src/main/res/drawable
          color: '#FF0000',
          sound:'default',
          pressAction: {
            id: 'default',
          },
          // Optionally add BigPicture style, etc.
        },
      });

      Toast.show({
        type: "info",
        text1: "New Notification 📩",
        text2: remoteMessage.notification?.title || "You have a new message",
      });
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
      <Toast />
    </StripeProvider>
  );
};

export default App;

