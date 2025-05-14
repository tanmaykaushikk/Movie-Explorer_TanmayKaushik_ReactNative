import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  Image,
} from "react-native";
import React from "react";
import Carousel from "react-native-reanimated-carousel";


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

interface TrendingMoviesCarouselProps {
  isAdmin: boolean;
  data: MovieItem[];
  handleClick: (item: MovieItem) => void;
}

interface MovieCardProps {
  item: MovieItem;
  handleClick: (item: MovieItem) => void;
  isAdmin: boolean;
}

const { width, height } = Dimensions.get("window");

const TrendingMoviesCarousel: React.FC<TrendingMoviesCarouselProps> = ({
  data, isAdmin, handleClick
}) => {
  console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaaaa", data)
  // const handleClick = (item:any) => {
  //     navigation.navigate("Movie" as never, { movie:item } as never);
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.trending}>Trending</Text>
      <Carousel
        loop={true}
        autoPlay={true}
        width={width * 0.9}
        height={height * 0.6}
        data={data}
        renderItem={({ item }) => (
          <MovieCard item={item} handleClick={handleClick} isAdmin={isAdmin} />
        )}
        style={{ justifyContent: "center", alignSelf: "center" }}
        // slideStyle={{ display: "flex", alignItems: "center" }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 60,
        }}
      />
    </View>
  );
};

const MovieCard:React.FC<MovieCardProps> = ({ item, handleClick, isAdmin }) => {
  return (
    <TouchableWithoutFeedback onPress={() => handleClick(item)} testID={`card-${item.id}`}>
      <View style={styles.cardContainer}>
        <Image
          source={{ uri: item.poster_url }}
          style={styles.posterImage}
          accessibilityRole="image"
        />


        {item.premium && (
          <Image
            source={require("../assets/Images/crown.png")}
            style={styles.premiumIcon}
            resizeMode="contain"
            testID="premium-icon"
          />
        )}
        {isAdmin && (
          <Image style={styles.edit} source={require("../assets/Images/pen.png")} testID="edit-icon" />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TrendingMoviesCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  trending: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  posterImage: {
    width: "100%",
    height: height * 0.5,
    borderRadius: 20,
  },
  cardContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  edit: {
    position: "absolute",
    top: 8,
    right: 30,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  premiumIcon: {
    position: "absolute",
    top: 8,
    left: 30,
    width: 30,
    height: 30,
    zIndex: 2,
  },


});
