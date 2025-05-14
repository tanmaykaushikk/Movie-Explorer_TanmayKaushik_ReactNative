import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Dimensions,
  } from "react-native";
  import React, { useEffect } from "react";
  import { useRoute } from "@react-navigation/native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { StatusBar } from 'react-native';
  import LinearGradient from 'react-native-linear-gradient';
  
  const { width, height } = Dimensions.get("window");
  
  const MovieScreen = () => {
    const {
      params: { movie },
    } = useRoute<any>();
  
    // useEffect(() => {
    //   // you can call API if needed with movie.id
    // }, [movie]);
  
    return (
      <View style={{ backgroundColor: "black", flex: 1 }}>
        <StatusBar testID="status-bar"/>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View>
            <View>
              <Image
                source={{ uri: movie.poster_url }}
                style={styles.bgImage}
                resizeMode="cover"
                testID="movie-poster-image" 
              />
              <LinearGradient
                colors={["transparent", "rgba(96, 92, 92, 0.55)", "rgb(0, 0, 0)"]}
                style={styles.gradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                testID="gradient-overlay"
              />
            </View>
          </View>
  
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.titleDes}>
              Released - {movie.release_year} - {movie.duration} m
            </Text>
            <Text style={styles.titleDes}>
              {movie.genre} - Directed by {movie.director}
            </Text>
            <Text style={styles.titleDes}>⭐ {movie.rating} / 10</Text>
          </View>
  
          <View style={styles.movieDescriptionContainer}>
            <Text style={styles.movieDes}>{movie.description}</Text>
          </View>
        </ScrollView>
      </View>
    );
  };
  
  export default MovieScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    bgImage: {
      width: width,
      height: height * 0.55,
    },
    gradient: {
      width: width,
      height: height * 0.55,
      position: "absolute",
    },
    detailsContainer: {
      paddingHorizontal: 16,
      marginTop: -50,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: "white",
      fontSize: 40,
      fontWeight: "bold",
      marginTop: 20,
      textAlign: "center",
    },
    titleDes: {
      color: "silver",
      fontSize: 14,
      marginTop: 5,
      textAlign: "center",
    },
    movieDescriptionContainer: {
      paddingHorizontal: 16,
      marginTop: 20,
    },
    movieDes: {
      color: "grey",
      fontSize: 16,
      lineHeight: 25,
      textAlign: "justify",
    },
  });
  