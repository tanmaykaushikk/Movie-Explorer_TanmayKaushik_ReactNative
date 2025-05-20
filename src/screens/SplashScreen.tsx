import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing
} from "react-native";
import React, { useEffect, useRef } from "react";
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width } = Dimensions.get("window");

const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

const SplashScreen: React.FC = ({ navigation }: any) => {
const scaleAnim = useRef(new Animated.Value(0.1)).current; // start super small
const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  Animated.parallel([
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }),
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]).start();

  const timeout = setTimeout(() => {
    handleStart();
  }, 3000);

  return () => clearTimeout(timeout);
}, []);


  const handleStart = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.setItem("role", "guest");
    }
    catch (error) {
      console.log("failed to clear the storage", error);
    }
    navigation.replace("HomePage");
  };

  return (
    <ImageBackground
      source={require("../assets/Images/loginbackground.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgb(17, 17, 17)", "rgba(7, 8, 8, 0.84)"]}
        style={styles.gradient}
      >
        <Animated.View style={{
        transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          alignItems:"center",
          marginTop: -hp(20)
        }}>
          <Text style={styles.welcome}>
            <Text style={styles.film}>FILM</Text>
            <Text style={styles.hunt}>HUNT</Text>
          </Text>
          {/* <Text style={styles.areyou}>Are you ready to explore?</Text> */}
        </Animated.View>
        {/* <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}
              onPress={handleStart}>
              Let's Start
            </Text>
          </TouchableOpacity>
        </View> */}
      </LinearGradient>
    </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  gradient: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(10),
    justifyContent: "center",
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: hp(60),
  },

  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: hp(2),
    paddingHorizontal: wp(10),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: 'white',
  },

  buttonText: {
    color: 'white',
    fontSize: wp(5),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  welcome: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    alignSelf: "center"

  },
  areyou: {
    fontSize: 20,
    fontWeight: "600",
    color: "silver",
    alignSelf: "center",
    top: 20,
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
