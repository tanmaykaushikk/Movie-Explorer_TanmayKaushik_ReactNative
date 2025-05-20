/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);

    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Background Notification',
        body: remoteMessage.notification?.body || '',
        android: {
            channelId: 'default',
            smallIcon: 'ic_launcher',
             sound:'default', 
            pressAction: {
                id: 'default',
            },
        },
    });
});

AppRegistry.registerComponent(appName, () => App);
