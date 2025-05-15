import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Login from "../../src/screens/Login";
import { loginAPI } from "../../src/utils/Api";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

// 👇 Inline AsyncStorage mock
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// 👇 Mock loginAPI
jest.mock("../../src/utils/Api", () => ({
  loginAPI: jest.fn(),
}));

// 👇 Mock navigation
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

describe("Login Screen (Basic Tests)", () => {
  const setup = () =>
    render(
      <NavigationContainer>
        <Login />
      </NavigationContainer>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password inputs", () => {
    const { getByPlaceholderText } = setup();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("shows error for empty inputs", async () => {
    const { getByText } = setup();
    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(getByText("Email is required")).toBeTruthy();
      expect(getByText("Password is required")).toBeTruthy();
    });
  });

  it("calls loginAPI and navigates on valid login", async () => {
    const mockUser = { role: "user" };
    (loginAPI as jest.Mock).mockResolvedValue(mockUser);
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByPlaceholderText, getByText } = setup();
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(loginAPI).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(alertSpy).toHaveBeenCalledWith("Login successful");
    });
  });

  it("shows error alert on failed login", async () => {
    (loginAPI as jest.Mock).mockRejectedValue(new Error("Invalid login"));
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByPlaceholderText, getByText } = setup();
    fireEvent.changeText(getByPlaceholderText("Email"), "wrong@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "wrongpass");
    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Invalid email or password");
    });
  });
});
