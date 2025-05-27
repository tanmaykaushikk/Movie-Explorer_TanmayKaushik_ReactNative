import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { deleteMovie } from "../utils/Api";
import { getMoviesById } from "../utils/Api";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

interface MovieItem {
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
  poster_url: string;
  banner_url: string;
}

interface MovieListProps {
  title: string;
  data: MovieItem[];
  handleClick: (item: MovieItem) => void;
  isAdmin: boolean;
  isPremiumSubscribed: boolean;
  isGuest: boolean;
}

type NavigationParamList = {
  SeeAll: { title: string; movies: MovieItem[] };
  Movie: { movie: MovieItem };
  Update: { movie: MovieItem };
};

const MovieList: React.FC<MovieListProps> = ({ title, data, handleClick, isAdmin, isPremiumSubscribed, isGuest }) => {
  const navigation = useNavigation<NativeStackNavigationProp<NavigationParamList>>();

  const [movieList, setMovieList] = useState<MovieItem[]>(data);

  useEffect(() => {
    setMovieList(data);
  }, [data]);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this movie?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const response = await deleteMovie(id);
              if (response) {
                setMovieList((prevList) => prevList.filter((movie) => movie.id !== id));
                // Alert.alert("Movie Deleted Successfully");
                Toast.show({
                  type: "success",
                  text1: "Movie Deleted",
                  text2: "The movie has been deleted successfully",
                });
                // Optionally, refresh the movie list here
              } else {
                // Alert.alert("Failed to delete movie");
                Toast.show({
                  type: "error",
                  text1: "Failed to delete movie",
                });
              }
            } catch (error) {
              console.error("Delete Movie Error:", error);
              // Alert.alert("An error occurred while deleting the movie.");
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occurred while deleting the movie.",
              });
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleSeeAll = () => {
    console.log("isGuest in MovieList:", isGuest);
    if (isGuest) {
      // Alert.alert(
      //   "Login Required",
      //   "Please login to view all movies.",
      //   [
      //     { text: "Cancel", style: "cancel" },
      //     {
      //       text: "Login",
      //       onPress: () => navigation.navigate("Login"),
      //     },
      //   ]
      // );
      Toast.show({
        type: "info",
        text1: "Login Required",
        text2: "Please login to view all movies.",
      });
      navigation.navigate("Login");
      return;
    }

    navigation.navigate("SeeAll", { title, movies: movieList, isGuest });
  };

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>{title}</Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 10 }}>
        {movieList.map((item) => (
          <TouchableWithoutFeedback
            key={item.id}
            onPress={async () => {
              try {
                const updateMovie = await getMoviesById(item.id);
                if (updateMovie) {
                  handleClick(updateMovie);
                } else {
                  // Alert.alert("Error. Could not fetch the movie")
                  Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Could not fetch the movie details.",
                  });
                }
              } catch (error) {
                // Alert.alert("Error. Something went wrong fetching movie")
                    Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Something went wrong fetching the movie.",
                });
              }
            }}
            onLongPress={() => isAdmin && handleDelete(item.id)}
            testID={`movie-touchable-${item.id}`}
          >
            <View style={styles.movieImageContainer}>
              <Image source={{ uri: item.poster_url }} testID="image" accessibilityRole="image" style={styles.movieImage} />

              {item.premium && !isAdmin && !isPremiumSubscribed && (
                <Image
                  source={require("../assets/Images/crown.png")}
                  style={styles.premiumIcon}
                  resizeMode="contain"
                  accessibilityRole="image"
                />
              )}

              {isAdmin && (
                <TouchableOpacity style={styles.edit} onPress={() => navigation.navigate("Update", { movie: item })}
                  testID={`edit-icon-${item.id}`}>
                  <Image accessibilityRole="image" source={require("../assets/Images/pen.png")} style={styles.edit} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        ))}
      </ScrollView>
    </View>
  );
};

export default MovieList;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  titleText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  seeAll: {
    color: "silver",
    fontSize: 12,
    fontWeight: "bold",
  },
  movieImageContainer: {
    marginRight: 15,
    width: width * 0.3,
    height: width * 0.45,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  movieImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover"
  },
  edit: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    padding: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  premiumIcon: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    zIndex: 2,
  },
});


























