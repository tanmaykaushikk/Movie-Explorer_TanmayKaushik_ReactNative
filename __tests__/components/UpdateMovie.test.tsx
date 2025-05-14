import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import UpdateMovie from "../../src/components/UpdateMovie";
import { NavigationContainer } from "@react-navigation/native";
import { updateMovie } from "../../src/utils/Api";

// Mock the API and navigation
jest.mock("../../src/utils/Api", () => ({
  updateMovie: jest.fn(),
}));

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: {
        movie: {
          id: 1,
          title: "Test Movie",
          genre: "Action",
          release_year: 2020,
          rating: 8.2,
          director: "Test Director",
          duration: 120,
          description: "Test Description",
          premium: true,
          main_lead: "Test Lead",
          streaming_platform: "Netflix",
          poster_url: "https://example.com/poster.jpg",
          banner_url: "",
        },
      },
    }),
  };
});

describe("UpdateMovie Screen", () => {
  it("renders all input fields and pre-fills them with movie data", () => {
    const { getByPlaceholderText } = render(
      <NavigationContainer>
        <UpdateMovie />
      </NavigationContainer>
    );

    expect(getByPlaceholderText("Title").props.value).toBe("Test Movie");
    expect(getByPlaceholderText("Genre").props.value).toBe("Action");
    expect(getByPlaceholderText("Release Year").props.value).toBe("2020");
    expect(getByPlaceholderText("Director").props.value).toBe("Test Director");
  });

  it("updates the movie when the button is pressed", async () => {
    (updateMovie as jest.Mock).mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <UpdateMovie />
      </NavigationContainer>
    );

    fireEvent.changeText(getByPlaceholderText("Title"), "Updated Title");
    fireEvent.press(getByText("Update Movie"));

    await waitFor(() => {
      expect(updateMovie).toHaveBeenCalledWith(1, expect.objectContaining({
        title: "Updated Title",
        release_year: 2020,
        rating: 8.2,
        duration: 120,
      }));
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it("shows an error alert if the update fails", async () => {
    (updateMovie as jest.Mock).mockResolvedValue(false);
    const alertSpy = jest.spyOn(global, "alert").mockImplementation(() => {});

    const { getByText } = render(
      <NavigationContainer>
        <UpdateMovie />
      </NavigationContainer>
    );

    fireEvent.press(getByText("Update Movie"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  it("toggles the premium switch", () => {
    const { getByText, getByA11yRole } = render(
      <NavigationContainer>
        <UpdateMovie />
      </NavigationContainer>
    );

    const switchComponent = getByA11yRole("switch");
    expect(switchComponent.props.value).toBe(true);

    fireEvent(switchComponent, "valueChange", false);
    expect(switchComponent.props.value).toBe(false);
  });
});
