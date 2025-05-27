import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
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
  duration?: string;
}

const PlanOption = ({
  title,
  price,
  features,
  isPopular,
  currentPlan,
  duration,
}: PlanOptionProps) => {
  const navigation = useNavigation();
  const isCurrentPlan = currentPlan?.toLowerCase() === title.toLowerCase();

  const handlePayment = async (title: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await createSubscription(title, token);

      if (res?.url && res?.session_id) {
        await AsyncStorage.setItem("subscription", title);
        navigation.navigate("Payment", {
          url: res.url,
          session: res.session_id,
        });
      } else {
        console.warn("Invalid response from server", res);
      }
    } catch (error) {
      console.error("error in handle payment", error);
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
        colors={
          isPopular
            ? ["#1a1a1a", "#333333", "#1a1a1a"]
            : ["#000000", "#111111", "#1a1a1a"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.planBox,
          isPopular && styles.popularPlan,
          isCurrentPlan && styles.selectedPlan,
        ]}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{title.replace("_", " ").toUpperCase()}</Text>
          {duration && (
            <Text style={styles.durationText}>{duration}</Text>
          )}
          <Text style={styles.priceText}>{price}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.bulletPoint}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isCurrentPlan ? (
          <Text style={styles.currentPlanText}>
            You currently have this plan
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

  const plans = [
    {
      title: "1_day",
      price: "$1.99",
      features: [
        "Full access to all movies",
        "Unlimited streaming",
        "HD quality",
        "No ads",
      ],
      duration: "24 hours of premium access",
      isPopular: false,
    },
    {
      title: "7_day",
      price: "$7.99",
      features: [
        "Full access to all movies",
        "Unlimited streaming",
        "HD & 4K quality",
        "No ads",
        "Offline downloads",
      ],
      duration: "7 days of premium access",
      isPopular: true,
    },
    {
      title: "1_month",
      price: "$19.99",
      features: [
        "Full access to all movies",
        "Unlimited streaming",
        "HD & 4K quality",
        "No ads",
        "Offline downloads",
        "Priority customer support",
        "Early access to new releases",
      ],
      duration: "30 days of premium access",
      isPopular: false,
    },
  ];

  return (
    <ImageBackground
      style={styles.container}
      source={require("../assets/Images/loginbackground.jpg")}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          "rgba(20,20,30,0.95)",
          "rgba(20,20,30,0.8)",
          "rgba(20,20,30,0.95)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerContainer} testID="headerContainer">
          <Text style={styles.headerTitle}>
            <Text style={styles.film}>FILM</Text>
            <Text style={styles.hunt}>HUNT</Text>
          </Text>
          <Text style={styles.subHeaderText}>
            Unlock premium content with a subscription that fits your schedule
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {plans.map((plan) => (
            <PlanOption
              key={plan.title}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              isPopular={plan.isPopular}
              currentPlan={currentPlan}
              duration={plan.duration}
            />
          ))}

          <View style={styles.guaranteeContainer}>
            <Text style={styles.guaranteeText}>✓ 30-day money back guarantee</Text>
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
  },
  gradient: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(6),
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: hp(4),
  },
  headerTitle: {
    color: "#fff",
    fontSize: wp(7),
    fontWeight: "bold",
    marginBottom: hp(1),
  },
  subHeaderText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: wp(4),
    textAlign: "center",
  },
  planContainer: {
    marginBottom: hp(3),
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -hp(2),
    right: wp(7),
    backgroundColor: "#ff9800",
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    borderRadius: 20,
    zIndex: 10,
    shadowColor: "#ff9800",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  popularText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: wp(3.5),
    letterSpacing: 1,
  },
  planBox: {
    borderRadius: 12,
    padding: wp(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: "#ff9800",
  },
  selectedPlan: {
    borderWidth: 2,
    borderColor: "#ff0000",
    shadowColor: "#ff0000",
    shadowOpacity: 0.8,
  },
  planHeader: {
    marginBottom: hp(2),
  },
  planTitle: {
    color: "#fff",
    fontSize: wp(6),
    fontWeight: "bold",
    marginBottom: hp(0.5),
  },
  durationText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: wp(3.5),
    marginBottom: hp(1),
  },
  priceText: {
    color: "#fff",
    fontSize: wp(7),
    fontWeight: "bold",
  },
  featuresContainer: {
    marginBottom: hp(2),
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.8),
  },
  bulletPoint: {
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: wp(4),
    marginRight: wp(2),
  },
  featureText: {
    color: "#ccc",
    fontSize: wp(4),
  },
  currentPlanText: {
    color: "#ff4d4d",
    fontWeight: "bold",
    fontSize: wp(4),
    textAlign: "center",
    marginTop: hp(1),
  },
  subscribeButton: {
    backgroundColor: "#2196f3",
    paddingVertical: hp(1.5),
    borderRadius: 10,
    marginTop: hp(1),
    shadowColor: "#2196f3",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  popularButton: {
    backgroundColor: "#ff9800",
    shadowColor: "#ff9800",
  },
  buttonText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: hp(5),
  },
  guaranteeContainer: {
    marginTop: hp(3),
    alignItems: "center",
  },
  guaranteeText: {
    color: "#ff9800",
    fontSize: wp(4),
    fontWeight: "bold",
  },
  film: {
    color: "red",
    fontWeight: "bold",
    fontSize: 40,
  },
  hunt: {
    color: "white",
    fontWeight: "bold",
    fontSize: 40,
  },
});






