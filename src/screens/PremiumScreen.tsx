import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ImageBackground
} from "react-native";
import React, { useEffect, useState } from "react";
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSubscription } from "../utils/Api";

const { width, height } = Dimensions.get("window");

const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

interface PlanOptionProps {
  title: string;
  price: string;
  features: string[];
  isPopular: boolean;
  currentPlan: string | null; 
}

const PlanOption = ({ title, price, features, isPopular, currentPlan }: PlanOptionProps) => {
  const navigation = useNavigation();
  const isCurrentPlan = currentPlan?.toLowerCase() === title.toLowerCase(); 

  const handlePayment = async (title: string) => {
    try{
      const token = await AsyncStorage.getItem('token');
      const res = await createSubscription(title, token);

    if(res?.url && res?.session_id){
      await AsyncStorage.setItem("subscription",title);
      navigation.navigate("Payment", {
         url: res.url,
        session: res.session_id
      });
    }
    else{
      console.warn("Invalid response from server" , res);
    }
  }
    catch(error){
      console.error("error in handle payment",error);
    }
  };

  return (
    <View style={styles.planContainer} testID={`plan-${title}`}>
      {isPopular && (
        <View style={styles.popularBadge} testID="popularBadge">
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      <LinearGradient
        colors={isPopular ? ['#333', '#222', '#111'] : ['#222', '#1a1a1a', '#0d0d0d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.planBox, isPopular && styles.popularPlan]}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.perMonth}>/month</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isCurrentPlan ? (
          <Text style={{ color: '#ccc', textAlign: 'center', marginTop: 10 }}>
            You already have this plan
          </Text>
        ) : (
          <TouchableOpacity
            style={[styles.subscribeButton, isPopular && styles.popularButton]}
            onPress={() => handlePayment(title)}
            testID={`subscribe-${title}`}
          >
            <Text style={styles.buttonText}>Subscribe Now</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const PremiumScreen = () => {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null); 

  useEffect(() => {
    const fetchSubscription = async () => {
      const plan = await AsyncStorage.getItem("subscription"); 
      setCurrentPlan(plan);
    };
    fetchSubscription();
  }, []);

  const basicFeatures = [
    "Basic Features Access",
    "Standard Quality",
    "Ad-free Experience",
    "Single Device Support"
  ];

  const premiumFeatures = [
    "All Basic Features",
    "Premium Quality",
    "Multi-Device Support",
    "Priority Customer Service",
    "Exclusive Content Access"
  ];

  return (
    <ImageBackground
      style={styles.container}
      source={require("../assets/Images/loginbackground.jpg")}
    >
      <LinearGradient
        colors={["#333333", "#222222", "#111111", "#000000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerContainer} testID="headerContainer">
          <Text style={styles.premiumBadge} testID="premiumBadge">PREMIUM</Text>
          <Text style={styles.headerText} testID="headerText">Upgrade Your Experience</Text>
          <Text style={styles.subHeaderText} testID="subHeaderText">No commitment. Cancel anytime.</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <PlanOption
            title="1_day"
            price="9.99"
            features={basicFeatures}
            isPopular={false}
            currentPlan={currentPlan} 
          />

          <PlanOption
            title="7_days"
            price="19.99"
            features={premiumFeatures}
            isPopular={true}
            currentPlan={currentPlan} 
          />

          <PlanOption
            title="1_month"
            price="19.99"
            features={premiumFeatures}
            isPopular={true}
            currentPlan={currentPlan} 
          />

          <View style={styles.guaranteeContainer}>
            <Text style={styles.guaranteeText} testID="moneyBackGuarantee">✓ 30-day money back guarantee</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default PremiumScreen;


 const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
  },
  gradient: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(5),
  },
  headerContainer: {
    alignItems: "center",
    marginTop: hp(4),
    marginBottom: hp(3),
  },
  premiumBadge: {
    backgroundColor: '#333',
    color: '#999',
    fontSize: wp(3.5),
    fontWeight: "bold",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: 15,
    marginBottom: hp(1.5),
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  headerText: {
    fontSize: wp(7),
    color: "white",
    fontWeight: "bold",
    marginBottom: hp(1),
    textAlign: "center",
  },
  subHeaderText: {
    color: "#999",
    fontSize: wp(3.8),
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: hp(10),
  },
  planContainer: {
    marginBottom: hp(3),
    position: 'relative',
    alignItems: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: -hp(1.2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    backgroundColor: '#444',
    zIndex: 1,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  popularText: {
    color: '#ccc',
    fontSize: wp(3),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  planBox: {
    width: wp(85),
    borderRadius: 15,
    padding: wp(5),
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popularPlan: {
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: "#111",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  planHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: hp(2),
    marginBottom: hp(2),
  },
  planTitle: {
    fontSize: wp(5),
    color: "white",
    fontWeight: "bold",
    marginBottom: hp(1),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currency: {
    color: '#aaa',
    fontSize: wp(4.5),
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  price: {
    fontSize: wp(8),
    color: "white",
    fontWeight: "bold",
  },
  perMonth: {
    color: '#aaa',
    fontSize: wp(3.5),
    marginBottom: hp(0.5),
    marginLeft: wp(1),
  },
  featuresContainer: {
    marginVertical: hp(2),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  bulletPoint: {
    color: '#666',
    fontSize: wp(6),
    marginRight: wp(2),
    lineHeight: wp(5),
  },
  featureText: {
    color: '#ddd',
    fontSize: wp(4),
  },
  subscribeButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: hp(1.8),
    alignItems: 'center',
    marginTop: hp(2),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  popularButton: {
    backgroundColor: '#444',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    color: "white",
    fontSize: wp(4.2),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  guaranteeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  guaranteeText: {
    color: '#777',
    fontSize: wp(3.5),
    textAlign: 'center',
  },
});





