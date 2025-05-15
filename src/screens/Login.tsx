import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Alert,
  } from "react-native";
  import React, { useState } from "react";
  import LinearGradient from 'react-native-linear-gradient';
  import { useNavigation } from "@react-navigation/native";
  import { getSubscripstionStatus, loginAPI } from "../utils/Api";
  import { NativeStackNavigationProp } from "@react-navigation/native-stack";
  import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
  const { height, width } = Dimensions.get("window");


  
  const wp = (percent: number) => (width * percent) / 100;
  const hp = (percent: number) => (height * percent) / 100;

  
type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList>;
  
  const Login: React.FC = () => {
    const navigation = useNavigation<LoginNavigationProp>();
  
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});
  
  
    const handleLogin = async () => {
     const formErrors: any = {};

    if (!email) formErrors.email = "Email is required";
    else if (!email.includes("@"))
      formErrors.email = "Please enter a valid email address";

    if (!password) formErrors.password = "Password is required";
    else if (password.length < 8)
      formErrors.password = "Password must be at least 8 characters";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
      try {
        const user = await loginAPI({ email, password });

        const token = user?.token;
        if(!token) throw new Error("Token not found in the login response");

        const subcriptionStatus = await getSubscripstionStatus(token);
        console.log("user subscription" , subcriptionStatus);

        const userToStore = {
          ...user,
          premiumSubscribed: subcriptionStatus.plan_type === "premium",
        };

        await AsyncStorage.setItem("user",JSON.stringify(userToStore));
        
        if (user?.role === "supervisor") {
          Alert.alert("Admin login successful");
        } else if(subcriptionStatus.plan_type === "premium"){
          Alert.alert("Login successful - premium user");
        } else{
          Alert.alert("Login successful - Free user");
        }
        navigation.navigate("HomePage")

      } catch (error) {
        Alert.alert("Invalid email or password");
        console.error("Login Error:", error);
      }
    };
  
    return (
      <ImageBackground
        source={require("../assets/Images/loginbackground.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgb(56, 53, 53)", "rgba(9, 43, 56, 0.75)"]}
          style={styles.gradient}
        >
          <View style={styles.login}>
            <Text style={styles.loginText}>Log in To Your Account</Text>
          </View>
  
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="silver"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
                      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="silver"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.showButton}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Text style={{ color: "silver" }}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
          </View>
  
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.signupRedirect}>
            <Text style={styles.signupRedirectText}>
              Don't have an account?{" "}
              <Text
                style={styles.signupLink}
                onPress={() => {
                  navigation.navigate("SignupPage");
                }}
              >
                Create Account
              </Text>
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  };
  
  export default Login;
  
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
    login: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: hp(4),
    },
    loginText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: wp(6.5),
    },
    inputContainer: {
      marginBottom: hp(2),
    },
    input: {
      backgroundColor: "transparent",
      width: "100%",
      height: hp(6),
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      fontSize: wp(4),
      marginBottom: hp(2),
      color: "white",
    },
    passwordWrapper: {
      position: "relative",
    },
    showButton: {
      position: "absolute",
      right: wp(4),
      top: hp(1.5),
    },
    button: {
      backgroundColor: "transparent",
      paddingVertical: hp(2),
      borderRadius: wp(2),
      alignItems: "center",
      borderWidth: 1,
      borderColor: "silver",
    },
    buttonText: {
      color: "white",
      fontSize: wp(4),
      fontWeight: "600",
    },
    signupRedirect: {
      marginTop: hp(2),
      alignItems: "center",
    },
    signupLink: {
      color: "#00BFFF",
      fontSize: wp(4),
      fontWeight: "600",
    },
    signupRedirectText: {
      color: "white",
      fontSize: wp(4),
    },
     errorText: {
    color: "red",
    fontSize: wp(3.5),
    marginBottom: hp(1),
  },
  });

function alert(arg0: string) {
    throw new Error("Function not implemented.");
}
  