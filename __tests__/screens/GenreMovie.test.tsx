import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import GenreMovies from "../../src/screens/GenreMovies"; 
import { getMoviesByGenre } from "../../src/utils/Api";
import { useNavigation, useRoute } from "@react-navigation/native";

// Mock the API call
jest.mock("../../src/utils/Api", () => ({
  getMoviesByGenre: jest.fn(),
}));

// Mock the navigation hooks
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

describe("GenreMovies", () => {
  const mockNavigate = jest.fn();
  const mockRoute = { params: { genre: "Action" } };

  beforeEach(() => {
    useNavigation.mockReturnValue({ navigate: mockNavigate });
    useRoute.mockReturnValue(mockRoute);
  });

  it("renders loading state correctly", () => {
    const { getByText, getByTestId } = render(<GenreMovies />);

    expect(getByTestId("loading-indicator")).toBeTruthy();
    expect(getByText("Loading Action Movies...")).toBeTruthy();
  });

  it("renders error message and retry button when there's an error", async () => {
    // Mock the API call to throw an error
    getMoviesByGenre.mockRejectedValueOnce(new Error("Failed to load"));

    const { getByText, getByTestId } = render(<GenreMovies />);

    // Wait for the error state to appear
    await waitFor(() => {
      expect(getByText("Failed to load movies. Please try again.")).toBeTruthy();
      expect(getByText("Retry")).toBeTruthy();
    });

    // Fire retry button press
    fireEvent.press(getByText("Retry"));
    expect(getMoviesByGenre).toHaveBeenCalledTimes(2); // Ensure retry triggered the API call again
  });

  it("renders movie list when data is fetched successfully", async () => {
    // Mock a successful API response
    const mockMoviesData = [
      { id: 1, title: "Movie 1", poster_url: "https://via.placeholder.com/100x150", release_year: 2021, genre: "Action", duration: 120, rating: 8.5, streaming_platform: "Netflix" },
      { id: 2, title: "Movie 2", poster_url: "https://via.placeholder.com/100x150", release_year: 2020, genre: "Action", duration: 110, rating: 7.5, streaming_platform: "Hulu" },
    ];
    getMoviesByGenre.mockResolvedValueOnce(mockMoviesData);

    const { getByText, getByTestId } = render(<GenreMovies />);

    // Wait for movie list to render
    await waitFor(() => {
      expect(getByText("Movie 1")).toBeTruthy();
      expect(getByText("Movie 2")).toBeTruthy();
    });

    // Verify movie items are rendered with proper details
    expect(getByTestId("movie-item-1")).toHaveTextContent("Movie 1");
    expect(getByTestId("movie-item-2")).toHaveTextContent("Movie 2");
  });

  it("navigates to Movie detail screen when a movie is clicked", async () => {
    // Mock a successful API response
    const mockMoviesData = [
      { id: 1, title: "Movie 1", poster_url: "https://via.placeholder.com/100x150" },
    ];
    getMoviesByGenre.mockResolvedValueOnce(mockMoviesData);

    const { getByText } = render(<GenreMovies />);

    await waitFor(() => {
      fireEvent.press(getByText("Movie 1"));
      expect(mockNavigate).toHaveBeenCalledWith("Movie", { movie: mockMoviesData[0] });
    });
  });

  it("handles pull-to-refresh correctly", async () => {
    // Mock a successful API response
    const mockMoviesData = [
      { id: 1, title: "Movie 1", poster_url: "https://via.placeholder.com/100x150" },
    ];
    getMoviesByGenre.mockResolvedValueOnce(mockMoviesData);

    const { getByTestId } = render(<GenreMovies />);

    // Wait for movie list to render
    await waitFor(() => expect(getByTestId("movie-item-1")).toBeTruthy());

    // Simulate refresh action
    fireEvent(getByTestId("flatlist"), "refresh");
    await waitFor(() => expect(getMoviesByGenre).toHaveBeenCalledTimes(2)); // Ensure the API is called again on refresh
  });

  it("renders empty message when no movies are found", async () => {
    // Mock empty response from API
    getMoviesByGenre.mockResolvedValueOnce([]);

    const { getByText } = render(<GenreMovies />);

    await waitFor(() => {
      expect(getByText("No movies found in Action category")).toBeTruthy();
    });
  });

  it("renders movie items with correct styles", async () => {
    const mockMoviesData = [
      { id: 1, title: "Movie 1", poster_url: "https://via.placeholder.com/100x150", release_year: 2021, genre: "Action", duration: 120, rating: 8.5, streaming_platform: "Netflix" },
    ];
    getMoviesByGenre.mockResolvedValueOnce(mockMoviesData);

    const { getByTestId } = render(<GenreMovies />);

    // Wait for movie items to be rendered
    await waitFor(() => expect(getByTestId("movie-item-1")).toBeTruthy());

    // Check if the poster image is loaded correctly
    expect(getByTestId("movie-item-1")).toHaveStyle({ width: 100, height: 150 });
    // Check if the movie title is rendered
    expect(getByTestId("movie-item-1-title")).toHaveStyle({ fontSize: 18, fontWeight: "600" });
  });

  it("displays the back button", () => {
    const { getByTestId } = render(<GenreMovies />);

    expect(getByTestId("back-button")).toBeTruthy();
  });
});
