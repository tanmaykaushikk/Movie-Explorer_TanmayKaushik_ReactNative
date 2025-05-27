import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { getMoviesById, updateMovie } from "../utils/Api";
import Toast from "react-native-toast-message";

const { height, width } = Dimensions.get("window");
const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

type NavigationParamList = {
  Update: { movie: MovieItem };
};

type MovieItem = {
  id: number;
  title: string;
  genre: string;
  release_year: number;
  rating: number;
  director: string;
  duration: number;
  description: string;
  premium: boolean;
  main_lead: string;
  streaming_platform: string;
  poster_url: any;
  banner_url: any;
};

const UpdateMovie = () => {
  const route = useRoute<RouteProp<NavigationParamList, "Update">>();
  const navigation = useNavigation();
  const { movie } = route.params;

  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    title: "",
    genre: "",
    release_year: "",
    rating: "",
    director: "",
    duration: "",
    description: "",
    main_lead: "",
    streaming_platform: "",
    isPremium: false,
    poster_url: "",
  });



  const fetchUpdateMovieData = async () => {
    setLoading(true);
    try {
      const data = await getMoviesById(movie?.id);
      setFormState({
        title: data?.title || "",
        genre: data?.genre || "",
        release_year: data?.release_year !== undefined ? data?.release_year.toString() : "",
        rating: data?.rating !== undefined ? data?.rating.toString() : "",
        director: data?.director || "",
        duration: data?.duration !== undefined ? data?.duration.toString() : "",
        description: data?.description || "",
        main_lead: data?.main_lead || "",
        streaming_platform: data?.streaming_platform || "",
        isPremium: !!data?.premium,
        poster_url: data?.poster_url || "",
      });
    } catch (err: any) {
      // Alert.alert("Error", "Failed to load movie data?");
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load movie data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdateMovieData();
  }, []);

  const handleChange = (key: keyof typeof formState, value: string | boolean) => {
    setFormState({ ...formState, [key]: value });
  };

  const handleUpdate = async () => {
    const payload = {
      ...formState,
      release_year: parseInt(formState.release_year),
      rating: parseFloat(formState.rating),
      duration: parseInt(formState.duration),
      premium: formState.isPremium,
      poster_url: formState.poster_url,
    };

    try {
      const result = await updateMovie(movie.id, payload);
      console.log("result", result)
      if (result) {
        // Alert.alert("Success", "Movie updated successfully");
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Movie updated successfully',
        });
        navigation.goBack();
      } else {
        // Alert.alert("Error", "Failed to update movie");
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update movie',
        })
      }
    } catch (error) {
      // Alert.alert("Error", "Something went wrong");
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    }
  };


  return (
    <ImageBackground
      source={require("../assets/Images/loginbackground.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={["rgba(108, 115, 118, 0.83)", "rgb(1, 25, 35)"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Update Movie Details</Text>

          {[
            { key: "title", placeholder: "Title" },
            { key: "genre", placeholder: "Genre" },
            { key: "release_year", placeholder: "Release Year", keyboardType: "numeric" },
            { key: "director", placeholder: "Director" },
            { key: "duration", placeholder: "Duration (e.g., 120)", keyboardType: "numeric" },
            { key: "description", placeholder: "Description", multiline: true },
            { key: "main_lead", placeholder: "Main Lead Actor" },
            { key: "streaming_platform", placeholder: "Streaming Platform" },
            { key: "rating", placeholder: "Rating (e.g., 8.5)", keyboardType: "decimal-pad" },
          ].map((field) => (
            <TextInput
              key={field.key}
              style={[styles.input, field.multiline && styles.multilineInput]}
              placeholder={field.placeholder}
              placeholderTextColor="silver"
              value={formState[field.key]}
              onChangeText={(text) => handleChange(field.key, text)}
              keyboardType={field.keyboardType || "default"}
              multiline={field.multiline || false}
            />
          ))}

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Premium</Text>
            <Switch
              value={formState.isPremium}
              onValueChange={(value) => handleChange("isPremium", value)}
            />
          </View>

          {formState.poster_url ? (
            <Image
              source={{ uri: formState.poster_url }}
              style={{ width: 100, height: 150, alignSelf: "center", marginBottom: 10 }}
            />
          ) : null}

          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update Movie</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default UpdateMovie;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(5),
    justifyContent: "center",
  },
  scrollContainer: {
    paddingBottom: hp(10),
  },
  heading: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: hp(3),
  },
  input: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    fontSize: wp(4),
    marginBottom: hp(2),
    color: "white",
    height: hp(6),
  },
  multilineInput: {
    height: hp(12),
    textAlignVertical: "top",
  },
  label: {
    color: "white",
    fontSize: wp(4),
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp(2),
    padding: 10,
    marginBottom: hp(2),
  },
  button: {
    backgroundColor: "transparent",
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "silver",
    marginTop: hp(2),
  },
  buttonText: {
    color: "white",
    fontSize: wp(4),
    fontWeight: "600",
  },
});
