import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TrendingMoviesCarousel from "../components/TrendingMovieCarousel";
import MovieList from "../components/MovieList";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllMovies, getMoviesByGenre, getMoviesById, searchMovies } from "../utils/Api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import LottieView from 'lottie-react-native';
import Fuse from 'fuse.js';

const { width, height } = Dimensions.get("window");
const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

export type RootStackParamList = {
  Movie: { movie: any };
  GenreMovies: { genre: string };
  Edit: undefined;
  [key: string]: any | undefined;
};

const HomePage = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  interface Movie {
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

  const [trending, setTrending] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [forYou, setforYou] = useState<Movie[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremiumSubscribed, setIsPremiumSubscribed] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [genreMovies, setGenreMovies] = useState<Record<string, Movie[]>>({});
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);


  const genres = ["action", "comedy", "horror", "romance", "sci-fi"];
  const [fuse, setFuse] = useState<Fuse<Movie> | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setIsAdmin(user?.role === "supervisor");
          setIsPremiumSubscribed(user?.premiumSubscribed || false);
        } else {
          setIsAdmin(false);
          setIsPremiumSubscribed(false);
          setIsGuest(true);

        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsAdmin(false);
        setIsPremiumSubscribed(false);
        setIsGuest(true);
      } finally {
        const allMovies: any = await getAllMovies();
        if (allMovies && Array.isArray(allMovies.movies)) {
          setMovies(allMovies.movies);
            setFuse(new Fuse(allMovies.movies, {
            keys: ['title'],
            threshold: 0.4
          }));

          const trendingMovies = allMovies.movies.filter((movie: { rating: number; }) => movie.rating >= 8);
          setTrending(trendingMovies);
          const upcomingMovies = allMovies.movies.slice(5, 10);
          setUpcoming(upcomingMovies);
          const topRatedPool = allMovies.movies.filter((movie: { rating: number; }) => movie.rating >= 8);
          const randomTopRated = topRatedPool.sort(() => 0.5 - Math.random()).slice(0, 5);
          setTopRated(randomTopRated);
          const forYouMovies = [...allMovies.movies].sort(() => 0.5 - Math.random()).slice(0, 5);
          setforYou(forYouMovies);
        }

        const genreResults: Record<string, Movie[]> = {};
        for (const genre of genres) {
          const moviesForGenre = await getMoviesByGenre(genre);
          genreResults[genre] = moviesForGenre;
        }
        setGenreMovies(genreResults);

        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setMenuVisible(false);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const delayedDebounce = setTimeout(async () => {
      if (searchText.length >= 1) {
        try {
          const results = await searchMovies(searchText);
          setSearchResults(results);
          if (results.length === 0) {
            Toast.show({
              type: 'info',
              text1: 'No Movies Found',
              text2: `No results for "${searchText}"`,
            });
          }
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
          Toast.show({
            type: 'error',
            text1: 'Search Failed',
            text2: 'Could not fetch search results.',
          });
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayedDebounce);
  }, [searchText]);

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.length === 0) {
      setSuggestions([]);
      return;
    }

      if (fuse) {
      const matches = fuse.search(text);
      const topMatches = matches.map((match) => match.item).slice(0, 5);
      setSuggestions(topMatches);
    }



    // const filtered = movies.filter((movie) =>
    //   movie.title.toLowerCase().includes(text.toLowerCase())
    // );

    // setSuggestions(filtered.slice(0, 5));
  };

  const handleMovieClick = async (item: Movie) => {
    try {
      if (isGuest) {
        // Alert.alert(
        //   "Login Required",
        //   "Please login to view this movie.",
        //   [
        //     { text: "Cancel", style: "cancel" },
        //     {
        //       text: "Login",
        //       onPress: () => navigation.navigate("Login"),
        //     },
        //   ]
        // );
        Toast.show({
          type: 'info',
          text1: 'Login Required',
          text2: 'Please login to view this movie.',
          onPress: () => navigation.navigate("Login"),
          autoHide: false,
        });
        return;
      }
      if (item.premium && !isPremiumSubscribed && !isAdmin) {
        // Alert.alert(
        //   "Premium Content",
        //   "This movie requires a premium subscription. Would you like to subscribe?",
        //   [
        //     { text: "Cancel", style: "cancel" },
        //     {
        //       text: "Subscribe",
        //       onPress: () => navigation.navigate("Premium"),
        //     },
        //   ]
        // );
        Toast.show({
          type: 'info',
          text1: 'Premium Content',
          text2: 'Subscribe to watch this movie.',
          onPress: () => navigation.navigate("Premium"),
          autoHide: false,
        });
        return;
      }

      const movie = await getMoviesById(item.id);
      if (movie) {
        navigation.navigate("Movie", { movie });
      } else {
        // Alert.alert("Failed to fetch movie");
        Toast.show({
          type: 'info',
          text1: 'Movie Not Found',
          text2: 'Sorry, we could not find this movie.',
        });
      }
    } catch (error) {
      // Alert.alert("Something went wrong in fetching movie");
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Something went wrong while fetching movie details.',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={require("../assets/animation/dots.json")}
          autoPlay
          loop
          style={styles.lottieLoader}
        />
        {/* <Text style={styles.loaderText}>Loading movies...</Text> */}
      </View>
    );
  }

  return (
    <View style={styles.container} testID="test">
      <LinearGradient
        colors={["rgb(28, 28, 28)", "rgb(0, 0, 0)"]}
        style={styles.gradient}
      >
        <SafeAreaView>
          <StatusBar />
          <View style={styles.headerBar}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            >
              <Image
                source={require("../assets/Images/applogo.png")}
                style={styles.userImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ready for a movie adventure?"
                placeholderTextColor="silver"
                value={searchText}
                onChangeText={handleSearch}
              />
              <View style={styles.suggestionContainer}>
                {suggestions.map((movie) => (
                  <TouchableOpacity
                    key={movie.id}
                    onPress={() => {
                      setSearchText(movie.title);
                      setSuggestions([]);
                    }}
                    style={styles.suggestionItem}>
                    <Text style={styles.suggestionText}>{movie.title}</Text>

                  </TouchableOpacity>
                ))}

              </View>
            </View>

            {isAdmin ? (
              <TouchableOpacity onPress={() => navigation.navigate("Edit")}>
                <Image
                  source={require("../assets/Images/pennn.png")}
                  style={styles.editIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (isGuest) {
                    // Alert.alert(
                    //   "Login Required",
                    //   "Please login to manage subscriptions.",
                    //   [
                    //     { text: "Cancel", style: "cancel" },
                    //     { text: "Login", onPress: () => navigation.navigate("Login") },
                    //   ]
                    // );
                    Toast.show({
                      type: 'info',
                      text1: 'Login Required',
                      text2: 'Please login to manage subscriptions.',
                      onPress: () => navigation.navigate("Login"),
                      autoHide: false,
                    });
                    return;
                  }
                  navigation.navigate("Premium");
                }}

              >
                <Image
                  source={require("../assets/Images/dollar.png")}
                  style={styles.menuImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp(5) }}
          >
            {searchText.length >= 1 ? (
              <MovieList
                title={`Search Results for "${searchText}"`}
                isAdmin={isAdmin}
                data={searchResults}
                handleClick={handleMovieClick} isPremiumSubscribed={false}
                isGuest={isGuest} />
            ) : (
              <>
                {/*Trending Movies Carousel */}
                <View style={{ marginBottom: hp(-10) }}>
                  <TrendingMoviesCarousel
                    isAdmin={isAdmin}
                    data={trending}
                    handleClick={handleMovieClick}
                    isPremiumSubscribed={isPremiumSubscribed} />

                </View>

                {/* Upcoming Movies */}
                <MovieList
                  title="Upcoming Movies"
                  isAdmin={isAdmin}
                  data={upcoming}
                  handleClick={handleMovieClick}
                  isPremiumSubscribed={isPremiumSubscribed}
                  isGuest={isGuest} />

                {/* Top-Rated Movies */}
                <MovieList
                  title="Top-Rated Movies"
                  isAdmin={isAdmin}
                  data={topRated}
                  handleClick={handleMovieClick}
                  isPremiumSubscribed={isPremiumSubscribed}
                  isGuest={isGuest} />

                {/* For You */}
                <MovieList
                  isAdmin={isAdmin}
                  title="For You"
                  data={trending}
                  handleClick={handleMovieClick}
                  isPremiumSubscribed={isPremiumSubscribed}
                  isGuest={isGuest}
                />

                {/* Genre-based lists */}
                {Object.entries(genreMovies).map(([genre, movies]) => (
                  <MovieList
                    key={genre}
                    title={`${genre} Movies`}
                    isAdmin={isAdmin}
                    data={movies}
                    handleClick={handleMovieClick}
                    isPremiumSubscribed={isPremiumSubscribed}
                    isGuest={isGuest} />
                ))}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black"
  },
  gradient: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: wp(100),
    height: hp(8),
  },
  userImage: {
    width: wp(15),
    height: hp(15),
    borderRadius: wp(10) / 2,
    right: wp(3),
  },
  searchBar: {
    width: wp(60),
    height: hp(6),
    borderRadius: wp(15),
    borderWidth: 1,
    borderColor: "silver",
    left: wp(-4),
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: wp(4),
    color: "silver",
  },
  menuImage: {
    width: wp(10),
    height: hp(10),
    borderRadius: wp(10) / 2,
    marginRight: wp(8),
  },
  editIcon: {
    width: wp(10),
    height: hp(10),
    tintColor: "silver",
    marginRight: wp(8),
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: hp(2),
    color: "silver",
    fontSize: 16,
  },
  moviePosterContainer: {
    position: "relative",
  },
  moviePoster: {
    width: wp(40),
    height: hp(25),
    borderRadius: 10,
  },
  premiumIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    width: wp(8),
    height: hp(8),
  },
  lottieLoader: {
    width: wp(30),
    height: wp(30),
  },
suggestionContainer: {
    position: "absolute",
    top: hp(6),
    width: "100%",
    backgroundColor: "white",
    zIndex: 1000,
    borderRadius: 8,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: "#555",
    borderBottomWidth: 0.5,
  },
  suggestionText: {
    color: "black",
    fontSize: 14,
  },
});

















