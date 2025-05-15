import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomePage from "../../src/screens/HomePage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Mocking necessary modules
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: jest.fn(), // Now the mock function is inside the jest.mock() call
  }),
  DrawerActions: {
    toggleDrawer: jest.fn(),
  },
}));

jest.mock("react-native-async-storage", () => ({
  getItem: jest.fn(),
}));

// Create a basic stack navigator for testing navigation
const Stack = createNativeStackNavigator();
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator>{children}</Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
);

describe("HomePage", () => {
  it("renders loading indicator when data is fetching", () => {
    const { getByText } = render(
      <Wrapper>
        <HomePage />
      </Wrapper>
    );

    expect(getByText("Loading movies...")).toBeTruthy();
  });

  it("renders search input and allows text entry", async () => {
    const { getByPlaceholderText } = render(
      <Wrapper>
        <HomePage />
      </Wrapper>
    );

    const searchInput = getByPlaceholderText("Ready for a movie adventure?");
    fireEvent.changeText(searchInput, "Action");
    await waitFor(() => expect(searchInput.props.value).toBe("Action"));
  });

  it("should show the movie list if movies are loaded", async () => {
    // Mocking movie data
    jest.mock("../../src/utils/Api", () => ({
      getAllMovies: jest.fn(() => ({
        movies: [{ id: 1, title: "Movie 1", genre: "action", poster_url: "url" }],
      })),
    }));

    const { getByText } = render(
      <Wrapper>
        <HomePage />
      </Wrapper>
    );

    // Wait for movies to load and check if the title is rendered
    await waitFor(() => expect(getByText("Movie 1")).toBeTruthy());
  });

  it("should show the premium alert when clicking on a premium movie and the user is not subscribed", async () => {
    // Mocking the `Alert` and `AsyncStorage` for non-subscribed user
    const alertMock = jest.spyOn(global, "alert").mockImplementation();
    jest.mock("react-native-async-storage", () => ({
      getItem: jest.fn(() => Promise.resolve(JSON.stringify({ role: "user", premiumSubscribed: false }))),
    }));

    // Mocking movie data with premium content
    const premiumMovie = {
      id: 2,
      title: "Premium Movie",
      premium: true,
    };

    const { getByText } = render(
      <Wrapper>
        <HomePage />
      </Wrapper>
    );

    // Simulate movie click
    fireEvent.press(getByText("Premium Movie"));
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith(
      "Premium Content",
      "This movie requires a premium subscription. Would you like to subscribe?",
      expect.anything()
    ));
  });

  it("should navigate to the Premium screen when user presses 'Subscribe' on the premium alert", async () => {
    // Mock navigation
    const navigateMock = jest.fn(); // Define the mock function before jest.mock
    jest.mock("@react-navigation/native", () => ({
      ...jest.requireActual("@react-navigation/native"),
      useNavigation: () => ({
        navigate: navigateMock,
      }),
    }));

    // Mocking the premium movie and the Alert mock
    const alertMock = jest.spyOn(global, "alert").mockImplementation((_, __, buttons) => {
      buttons[1].onPress(); // Simulating the press on 'Subscribe'
    });

    const { getByText } = render(
      <Wrapper>
        <HomePage />
      </Wrapper>
    );

    // Simulate movie click
    fireEvent.press(getByText("Premium Movie"));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("Premium"));
  });
});
