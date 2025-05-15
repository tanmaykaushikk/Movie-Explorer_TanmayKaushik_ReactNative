import {
    ImageBackground,
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
  } from "react-native";
  import React, { useEffect } from "react";
  import LinearGradient from 'react-native-linear-gradient';
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  const { height, width } = Dimensions.get("window");
  
  const wp = (percent: number) => (width * percent) / 100;
  const hp = (percent: number) => (height * percent) / 100;
  
  const SplashScreen:React.FC = ({navigation} : any) => {

      useEffect(() => {
        setTimeout(() => {
          handleStart();
        }, 1000);
      }, [])
      
  
      const handleStart = async() => {
        try{
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("token");
          await AsyncStorage.setItem("role","guest");
        }
        catch(error){
          console.log("failed to clear the storage",error);
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
          <Text style={styles.welcome}>WELCOME</Text>
          <Text style={styles.areyou}>Are you ready to explore?</Text>
          <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}
                  onPress={handleStart}>
                      Let's Start
                  </Text>
              </TouchableOpacity>
          </View>
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
    welcome:{
      fontSize:40,
      fontWeight:"bold",
      color:"white",
      alignSelf:"center"

    },
    areyou:{
      fontSize:20,
      fontWeight:"600",
      color:"silver",
      alignSelf:"center",
      top:20,
    }
  });
  