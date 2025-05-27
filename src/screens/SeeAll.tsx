import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

const SeeAll: React.FC<{ route: any }> = ({ route }) => {
  const { title, movies, isGuest } = route.params || {};
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 4; // 2x2 grid = 4 movies per page

  if (!movies) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No movies available</Text>
      </View>
    );
  }

  const totalPages = Math.ceil(movies.length / moviesPerPage);
  const paginateMovies = (page: number) => {
    const start = (page - 1) * moviesPerPage;
    const end = page * moviesPerPage;
    return movies.slice(start, end);
  };

  const handleMoviePress = (movie: any) => {
    if (isGuest && movie.premium) {
      Alert.alert("Login Required", "Please login and subscribe to view premium movies.");
      return;
    }
    navigation.navigate("Movie", { movie, isGuest });
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const currentMovies = paginateMovies(currentPage);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.gridContainer}>
        {/* First Row */}
        <View style={styles.gridRow}>
          {currentMovies.length > 0 && (
            <TouchableWithoutFeedback
              onPress={() => { handleMoviePress(currentMovies[0]) }}
              testID="movie-0"
            >
              <View style={styles.movieCard}>
                <Image source={{ uri: currentMovies[0].poster_url }} style={styles.movieImage} />
              </View>
            </TouchableWithoutFeedback>
          )}
          {currentMovies.length > 1 && (
            <TouchableWithoutFeedback
              onPress={() => { handleMoviePress(currentMovies[1]) }}
              testID="movie-1"
            >
              <View style={styles.movieCard}>
                <Image source={{ uri: currentMovies[1].poster_url }} style={styles.movieImage} />
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        {/* Second Row */}
        <View style={styles.gridRow}>
          {currentMovies.length > 2 && (
            <TouchableWithoutFeedback
              onPress={() => { handleMoviePress(currentMovies[2]) }}
              testID="movie-2"
            >
              <View style={styles.movieCard}>
                <Image source={{ uri: currentMovies[2].poster_url }} style={styles.movieImage} />
              </View>
            </TouchableWithoutFeedback>
          )}
          {currentMovies.length > 3 && (
            <TouchableWithoutFeedback
              onPress={() => { handleMoviePress(currentMovies[3]) }}
              testID="movie-3"
            >
              <View style={styles.movieCard}>
                <Image source={{ uri: currentMovies[3].poster_url }} style={styles.movieImage} />
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={handlePreviousPage}
          disabled={currentPage === 1}
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.disabledButton,
          ]}
          testID="previous-button"
        >
          <Text style={styles.buttonText}>‹ Prev</Text>
        </TouchableOpacity>

        <Text testID="page-number" style={styles.pageNumber}>{`${currentPage} / ${totalPages}`}</Text>

        <TouchableOpacity
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
          testID="next-button"
        >
          <Text style={styles.buttonText}>Next ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 15,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
    paddingTop: 70,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  gridContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  movieCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    overflow: "hidden",
    width: width * 0.42,
    height: height * 0.27,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  movieImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 14,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  paginationButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  pageNumber: {
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
  },
});

export default SeeAll;