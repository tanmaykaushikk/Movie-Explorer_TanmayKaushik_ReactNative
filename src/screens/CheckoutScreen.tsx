import React, { useEffect, useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

export default function CheckoutScreen() {
  const [isPaymentSheetReady, setPaymentSheetReady] = useState(false);

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch('http://10.11.7.235:3000/payment-sheet', {
        method: 'POST',
      });
  
      const { clientSecret } = await response.json();
  
      if (!clientSecret) {
        console.log('Invalid clientSecret received');
        return;
      }
  
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Demo Store',
        paymentIntentClientSecret: clientSecret,
      });
  
      if (error) {
        console.log('initPaymentSheet error:', error);
      } else {
        setPaymentSheetReady(true);
        console.log('Payment sheet initialized successfully');
      }
    } catch (err) {
      console.log('Error initializing payment sheet:', err);
    }
  };
  

  useEffect(() => {
    fetchPaymentSheetParams();
  }, []);

  const openPaymentSheet = async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        console.log('Present PaymentSheet Error:', error);
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        Alert.alert('Success', 'Your payment is confirmed!');
      }
    } catch (err) {
      Alert.alert('Payment failed', 'Something went wrong.');
      console.error(err);
    }
  };

  return (
    <View style={{ marginTop: 100, padding: 20 }}>
      <Button
        title="Checkout"
        onPress={openPaymentSheet}
        disabled={!isPaymentSheetReady}
      />
    </View>
  );
}
