import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { Alert } from "react-native";
// const BASE_URL = "https://movie-explorer-ror-aalekh-2ewg.onrender.com";
const BASE_URL = 'https://movie-explorer-ror-agrim.onrender.com';

interface UserResponse {
  name: any;
  phone: any;
  id: number;
  email: string;
  role: string;
  token: string;
}

interface UserPayload {
  email: string;
  password: string;
}

export const loginAPI = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/users/sign_in`,
      { user: { email, password } },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const userData: UserResponse = { ...response.data };
    console.log("heloooooooooooooooooooooooooo", userData)

    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("token", userData.token);
    return userData;
  } catch (error) {
    console.log("Error Occurred while Signing In: ", error);
    throw new Error("Login failed.");
  }
};


export const signup = async (payload: { first_name: string, email: string, password: string, mobile_number: string, last_name?: string }) => {
    const { first_name, email, password, mobile_number, last_name = "rana" } = payload;

    try {
        const response = await axios.post(`${BASE_URL}/api/v1/users`,{ user: { first_name, email, password, mobile_number, last_name } },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );
        console.log('Signup response:', response);
        return response.data;
    } catch (error: any) {
        console.error('Error Occurred while Signing Up:', error);
        const errorMessage = error.response?.data?.errors ;
        console.log("ERROR MESSAGE: ", error.response?.data?.errors);

        if(errorMessage.length>1){
            Error(errorMessage[0]);
        }
        else{
            Error(errorMessage);
        }
        throw new Error(errorMessage);
    }
};


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
  poster_url ?: string;
  banner_url ?: string;
}

export const getAllMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/movies`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const movies: Movie[] = response.data;
    console.log("fetched movies", movies);

    return movies;
  } catch (error: any) {
    console.log("error ", error.message);
  }
};

export const getMoviesById = async (id: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/movies/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const movie: Movie = response.data;
    console.log("Fetched movie by ID:", movie);
    return movie;
  } catch (error: any) {
    console.error(`Error fetching movie with ID ${id}:`, error.message);
    return null;
  }
};

export const getMoviesByGenre = async (genre: string): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/movies`, {
      params: {
        genre,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const movies: Movie[] = response.data.movies || [];
    console.log(`Fetched movies for genre ${genre}:`, movies);
    return movies;
  } catch (error: any) {
    console.error(`Error fetching movies for genre ${genre}: `, error.message);
    return [];
  }
};



export const searchMovies = async (title: string): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/movies`, {
      params: {
        title,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const movies: Movie[] = response.data.movies || [];
    console.log(`Fetched movies for genre ${title}:`, movies);
    return movies;
  } catch (error: any) {
    console.error(`Error fetching movies for genre ${title}:`, error.message);
    return [];
  }
};


interface MovieFormData {
  poster: any;
  title: string;
  genre: string;
  release_year: string;
  director: string;
  duration: string;
  description: string;
  main_lead: string;
  streaming_platform: string;
  rating: string;
  isPremium: boolean;
  poster_url ?:  { uri: string; name: string; type: string } | null;
  banner_url ?:  { uri: string; name: string; type: string } | null;
}


export const createMovie = async (formData: MovieFormData): Promise<Movie | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log("Retrieved token:", token); 
    if (!token) {
      Alert.alert("You need to sign in first.");
      throw new Error("No authentication token found");
    }

    const movieFormData = new FormData();
    movieFormData.append("movie[title]", formData.title);
    movieFormData.append("movie[genre]", formData.genre);
    movieFormData.append("movie[release_year]", formData.release_year);
    movieFormData.append("movie[director]", formData.director);
    movieFormData.append("movie[duration]", formData.duration);
    movieFormData.append("movie[description]", formData.description);
    movieFormData.append("movie[main_lead]", formData.main_lead);
    movieFormData.append("movie[streaming_platform]", formData.streaming_platform);
    movieFormData.append("movie[rating]", formData.rating);
    movieFormData.append("movie[premium]", String(formData.isPremium));
      if (formData.poster) {
      movieFormData.append("movie[poster]", {
        uri: formData.poster.uri,
        name: formData.poster.name,
        type: formData.poster.type,
      } as any);
    }

    const response = await axios.post(`${BASE_URL}/api/v1/movies`, movieFormData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    const movie: Movie = response.data.movie;
    console.log("Movie created successfully:", movie);
    return movie;
  } catch (error: any) {
    console.error("Error creating movie:", error.message, error.response?.data);
    const errorMessage = error.response?.data?.error || "Failed to create movie";
    console.error(errorMessage);
    return null;
  }
};



export const deleteMovie = async (id: number): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log("Retrieved token:", token);
    if (!token) {
      Alert.alert("You need to sign in first.");
      throw new Error("No authentication token found");
    }

    await axios.delete(`${BASE_URL}/api/v1/movies/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log(`Movie with ID ${id} deleted successfully`);
    Alert.alert("Movie deleted successfully!");
    return true;
  } catch (error: any) {
    console.error("Error deleting movie:", error.message, error.response?.data);
    const errorMessage = error.response?.data?.error || "Failed to delete movie";
    Alert.alert(errorMessage);
    return false;
  }
};


export const sendTokenToBackend = async (fcmToken: string , authToken:string): Promise<any> => {
  console.log('sendtoken called')
  try {
    console.log(authToken)
    console.log(fcmToken)
    if (!authToken) {
      throw new Error('No user data found. User might not be logged in.');
    }

    // const user: token = JSON.parse(token);
    // const authToken = token
    if (!authToken) {
      throw new Error('No authentication token found in user data.');
    }

    console.log('Sending FCM token to backend:', fcmToken);
    console.log('Using auth token:', authToken);

    const response = await fetch(`${BASE_URL}/api/v1/users/update_device_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ device_token: fcmToken }),
    });
    console.log(response)
    console.log('Device token sent to backend successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending device token to backend:', error);
    throw error;
  }
};

export const updateMovie = async (id: number, formData: MovieFormData): Promise<Boolean | null> => {
  try {
    const token =  await AsyncStorage.getItem("token");
    console.log("Retrieved token:", token);
    if (!token) {
      Error("You need to sign in first.");
      throw new Error("No authentication token found");
    }

    const movieFormData = new FormData();
    movieFormData.append("movie[title]", formData.title);
    movieFormData.append("movie[genre]", formData.genre);
    movieFormData.append("movie[release_year]", formData.release_year);
    movieFormData.append("movie[director]", formData.director);
    movieFormData.append("movie[duration]", formData.duration);
    movieFormData.append("movie[description]", formData.description);
    movieFormData.append("movie[main_lead]", formData.main_lead);
    movieFormData.append("movie[streaming_platform]", formData.streaming_platform);
    movieFormData.append("movie[rating]", formData.rating);
    movieFormData.append("movie[premium]", String(formData.isPremium));
    if (formData.poster_url) {
      movieFormData.append("movie[poster]", formData.poster_url);
    }
    if (formData.banner_url) {
      movieFormData.append("movie[banner]", formData.banner_url);
    }

    const response = await axios.patch(`${BASE_URL}/api/v1/movies/${id}`, movieFormData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    const movie: Movie = response.data.movie;
    console.log("Movie updated successfully:", movie);
    return true;
  } catch (error: any) {
    console.error("Error updating movie:", error.message, error.response?.data);
    const errorMessage = error.response?.data?.error || "Failed to update movie";
    Error(errorMessage);
    return null;
  }
};



export const createSubscription = async (
  planType: string,
  token: string,
): Promise<any> => {
  console.log(planType)
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const response = await axios.post(
     'https://movie-explorer-ror-agrim.onrender.com/api/v1/subscriptions',
      {plan_type: planType,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('API Response:', response.data);

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    const checkoutUrl =
      response.data.checkoutUrl ||
      response.data.data?.checkoutUrl ||
      response.data.url;

    if (!checkoutUrl) {
      throw new Error('No checkout URL returned from server.');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    throw new Error(error.message || 'Failed to initiate subscription');
  }
};



export const GetSubscriptionStatus = async (session_id : string) => {
  try {
    const res = await axios.get(
      `https://movie-explorer-ror-agrim.onrender.com/api/v1/subscriptions/success?session_id=${session_id}`,
    );
    console.log(res);
    return res;
  } catch (error) {
    console.log('Error fetching:', error);
    return null;
  }
};



interface SubscriptionStatus {
  plan_type: 'premium' | 'none';
  created_at?: string;
  expires_at?: string;
}

interface ApiError {
  error: string;
}

export const getSubscripstionStatus = async (token: string): Promise<SubscriptionStatus> => {
  try {
    if (!token) {
      Error('You need to sign in first.');
      throw new Error('No authentication token found');
    }

    const response: AxiosResponse<{ subscription: SubscriptionStatus } | ApiError> = await axios.get(
      `${BASE_URL}/api/v1/subscriptions/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if ('error' in response.data) {
      throw new Error(response.data.error);
    }

    console.log('Subscription Status:', response.data.subscription);
    return response.data.subscription;
  } catch (error) {
    console.error('Subscription Status Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch subscription status');
    }
    throw new Error('An unexpected error occurred');
  }
};