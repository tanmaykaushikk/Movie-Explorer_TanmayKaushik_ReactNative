import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

const SeeAll: React.FC<{ route: any }> = ({ route }) => {
  const { title, movies } = route.params || {};
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 2;

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

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={paginateMovies(currentPage)}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate("Movie", { movie: item })}
            testID="movies-list"
          >
            <View style={styles.movieCard}>
              <Image source={{ uri: item.poster_url }} style={styles.movieImage} />
            </View>
          </TouchableWithoutFeedback>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />

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

        <Text   testID="page-number" style={styles.pageNumber}>{`${currentPage} / ${totalPages}`}</Text>

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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 80,
  },
  movieCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  movieImage: {
    height: height * 0.45,
    width: "100%",
    resizeMode: "cover",
  },
  movieTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
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


