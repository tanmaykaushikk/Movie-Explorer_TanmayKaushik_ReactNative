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
}

type NavigationParamList = {
  SeeAll: { title: string; movies: MovieItem[] };
  Movie: { movie: MovieItem };
  Update: { movie: MovieItem }; 
};

const MovieList: React.FC<MovieListProps> = ({ title, data, handleClick, isAdmin,isPremiumSubscribed }) => {
  const navigation = useNavigation<NativeStackNavigationProp<NavigationParamList>>();

  const [movieList , setMovieList] = useState<MovieItem[]>(data);

  useEffect(()=>{
    setMovieList(data);
  },[data]);

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
                Alert.alert("Movie Deleted Successfully");
                // Optionally, refresh the movie list here
              } else {
                Alert.alert("Failed to delete movie");
              }
            } catch (error) {
              console.error("Delete Movie Error:", error);
              Alert.alert("An error occurred while deleting the movie.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SeeAll", { title, movies: movieList })}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 10 }}>
        {movieList.map((item) => (
          <TouchableWithoutFeedback
            key={item.id}
            onPress={async () => {
              try{
                const updateMovie = await getMoviesById(item.id);
                if(updateMovie){
                  handleClick(updateMovie);
                }else{
                  Alert.alert("Error. Could not fetch the movie")
                }
              }catch(error){
                Alert.alert("Error. Something went wrong fetching movie")
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
                <TouchableOpacity style={styles.edit} onPress={() => navigation.navigate("Update" , {movie:item})}
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
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  movieImage: {
    width: 120,
    height: 170,
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


























