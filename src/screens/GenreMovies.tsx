import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { getMoviesByGenre } from "../utils/Api";
import { RootStackParamList } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width, height } = Dimensions.get("window");

type GenreMoviesRouteProp = RouteProp<RootStackParamList, 'GenreMovies'>;
type GenreMoviesNavigationProp = NativeStackNavigationProp<RootStackParamList>;


const GenreMovies = () => {
  const route = useRoute<GenreMoviesRouteProp>();
  const navigation = useNavigation<GenreMoviesNavigationProp>();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const genre = route.params?.genre || "Action";

  const fetchMovies = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log(`Fetching movies for genre: ${genre}`);
      
      const startTime = Date.now();
      const moviesData = await getMoviesByGenre(genre);
      const fetchDuration = Date.now() - startTime;
      
      
      if (fetchDuration < 10000) { 
        if (Array.isArray(moviesData)) {
          setMovies(moviesData);
        } else if (moviesData && Array.isArray(moviesData.movies)) {
          setMovies(moviesData.movies);
        } else {
          console.error("Invalid data format:", moviesData);
          setError("Received invalid data format. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to load movies. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("GenreMovies mounted with genre:", genre);
    
    const abortController = new AbortController();
    
    fetchMovies();

    return () => {
      console.log("GenreMovies unmounting");
      abortController.abort();
    };
  }, [genre, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

  const renderMovieItem = ({ item }: { item: any }) => (
    <TouchableWithoutFeedback
      onPress={() => navigation.navigate("Movie", { movie: item })}
    >
      <View style={styles.movieCard}>
        <Image
          source={{ uri: item.poster_url || 'https://via.placeholder.com/100x150' }}
          style={styles.posterImage}
          resizeMode="cover"
          onError={() => console.warn("Failed to load image:", item.poster_url)}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.movieDetails}>
            {item.release_year} • {item.genre} • {item.duration} mins
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.movieRating}>{item.rating}/10</Text>
            <Text style={styles.streamingPlatform}>
              {item.streaming_platform}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={["rgba(28, 28, 28, 0.94)", "rgb(0, 3, 6)"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading {genre} Movies...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["rgba(28, 28, 28, 0.94)", "rgb(0, 3, 6)"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{genre} Movies</Text>
        <View style={styles.placeholder} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
              colors={["#FFF"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No movies found in {genre} category
            </Text>
          }
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    fontSize: 16,
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: 'center',
  },
  movieCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 3,
  },
  posterImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  movieInfo: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "space-between",
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  movieDetails: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginVertical: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  movieRating: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "500",
  },
  streamingPlatform: {
    fontSize: 14,
    color: "#00BFFF",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default GenreMovies;