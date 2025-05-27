import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { launchImageLibrary, ImageLibraryOptions, Asset } from "react-native-image-picker";
import { createMovie } from "../utils/Api";
import { useRoute, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

const { height, width } = Dimensions.get("window");

const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

const EditScreen = () => {
  const route = useRoute();
  const { id } = (route.params || {}) as { id: number };
  const navigation = useNavigation();
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    title: "",
    genre: "",
    release_year: "",
    director: "",
    duration: "",
    description: "",
    main_lead: "",
    streaming_platform: "",
    rating: "",
    posterPreview: "",
    posterFile: null as any,
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (invalidFields.has(key)) {
      setInvalidFields((prev) => {
        const update = new Set(prev);
        return update;
      });
    }
  };

  const pickImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      quality: 1,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.error("ImagePicker Error: ", response.errorMessage);
        // Alert.alert("Error picking image");
        Toast.show({
          type: 'error',
          text1: 'Image Picker Error',
          text2: 'Something went wrong while picking image.',
        });
      } else if (response.assets && response.assets.length > 0) {
        const image: Asset = response.assets[0];
        const fileUri = image.uri || "";
        const fileName = fileUri.split("/").pop() || "image.jpg";
        const fileType = fileName.split(".").pop();

        const file = {
          uri: fileUri,
          name: fileName,
          type: image.type || "image/jpeg",
        };

        setForm((prev) => ({
          ...prev,
          posterPreview: fileUri,
          posterFile: file,
        }));
      }
    });
  };

  const handleAdd = async () => {
    const requiredFields = [
      "title",
      "genre",
      "release_year",
      "director",
      "duration",
      "description",
      "main_lead",
      "streaming_platform",
      "rating",
      "posterFile",

    ];

    const missingFields = requiredFields.filter((key) => {
      if (key === "posterFile") {
        return !form.posterFile;
      }
      return !form[key].trim();
    });

    if (missingFields.length > 0) {
      setInvalidFields(new Set(missingFields));
      // Alert.alert("Validation Error", "Please fill all required fields.");
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields.',
      });
      return;
    }


    setInvalidFields(new Set());

    try {
      const movieFormData = {
        title: form.title,
        genre: form.genre,
        release_year: form.release_year,
        director: form.director,
        duration: form.duration,
        description: form.description,
        main_lead: form.main_lead,
        streaming_platform: form.streaming_platform,
        rating: form.rating,
        isPremium: false,
        poster: form.posterFile,
        banner: null,
      };

      const newMovie = await createMovie(movieFormData as any);
      if (newMovie) {
        // Alert.alert("Movie added successfully!");
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Movie added successfully!',
        });
        setForm({
          title: "",
          genre: "",
          release_year: "",
          director: "",
          duration: "",
          description: "",
          main_lead: "",
          streaming_platform: "",
          rating: "",
          posterPreview: "",
          posterFile: null,
        });
      }
    } catch (error) {
      console.error("Add Movie Error:", error);
      // Alert.alert("Failed to add movie");
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add movie',
      });
    }
  };

  return (
    <ImageBackground
      source={require("../assets/Images/loginbackground.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(108, 115, 118, 0.83)", "rgb(1, 25, 35)"]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading} testID="edit-screen-heading" >Edit Movie Details</Text>

          {[
            { key: "title", placeholder: "Title" },
            { key: "genre", placeholder: "Genre" },
            { key: "release_year", placeholder: "Release Year", keyboardType: "numeric" },
            { key: "director", placeholder: "Director" },
            { key: "duration", placeholder: "Duration (e.g., 2h 15m)" },
            { key: "description", placeholder: "Description", multiline: true },
            { key: "main_lead", placeholder: "Main Lead Actor" },
            { key: "streaming_platform", placeholder: "Streaming Platform" },
            { key: "rating", placeholder: "Rating (e.g., 8.5)", keyboardType: "decimal-pad" },
          ].map((field) => {
            const isInvalid = invalidFields.has(field.key);
            return (
              <TextInput
                key={field.key}
                style={[styles.input, field.multiline && styles.multilineInput, isInvalid && styles.invalidInput,]}
                placeholder={field.placeholder}
                placeholderTextColor="silver"
                value={form[field.key]}
                onChangeText={(text) => handleChange(field.key, text)}
                keyboardType={field.keyboardType || "default"}
                multiline={field.multiline || false}
                testID={`input-${field.key}`}
              />
            );
          })}

          <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, invalidFields.has("posterFile") && styles.invalidInput]} testID="image-picker-button">
            <Text style={styles.imagePickerText}>Pick Poster Image</Text>
            {form.posterPreview ? (
              <Image
                source={{ uri: form.posterPreview }}
                style={{ width: 100, height: 150, marginTop: 10 }}
                testID="poster-preview"
              />
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleAdd} testID="add-movie-button">
            <Text style={styles.buttonText}>Add Movie</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default EditScreen;

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
  invalidInput: {
    borderColor: "red",
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: wp(2),
    alignItems: "center",
    marginBottom: hp(2),
  },
  imagePickerText: {
    color: "white",
    fontSize: wp(4),
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

























































