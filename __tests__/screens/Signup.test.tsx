import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Signup from "../../src/screens/Signup"; // Adjust path if needed
import { signup } from "../../src/utils/Api";
import { useNavigation } from "@react-navigation/native";

// Mock the necessary imports
jest.mock("../../src/utils/Api", () => ({
  signup: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

describe("Signup Screen", () => {
  const navigate = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    useNavigation.mockReturnValue({ navigate });
    jest.clearAllMocks();
  });

  it("should render Signup screen and inputs", () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);

    // Check if the text inputs for full name, email, password, and phone number are rendered
    expect(getByPlaceholderText("Full Name")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Phone Number")).toBeTruthy();

    // Check if the "Sign Up" button is rendered
    expect(getByText("Sign Up")).toBeTruthy();
  });


  it("should show error for invalid email format", () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);

    // Enter an invalid email
    fireEvent.changeText(getByPlaceholderText("Email"), "invalidEmail");

    // Simulate pressing the signup button
    fireEvent.press(getByText("Sign Up"));

    // Expect email validation error message
    expect(getByText("Please enter a valid email address")).toBeTruthy();
  });

  it("should show error for short password", () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);

    // Enter a password shorter than 8 characters
    fireEvent.changeText(getByPlaceholderText("Password"), "short");

    // Simulate pressing the signup button
    fireEvent.press(getByText("Sign Up"));

    // Expect password length validation error message
    expect(getByText("Password must be at least 8 characters long")).toBeTruthy();
  });

  it("should show error for short phone number", () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);

    // Enter a phone number shorter than 10 characters
    fireEvent.changeText(getByPlaceholderText("Phone Number"), "123456");

    // Simulate pressing the signup button
    fireEvent.press(getByText("Sign Up"));

    // Expect phone number length validation error message
    expect(getByText("Phone Number must be at least 10 characters long")).toBeTruthy();
  });


  it("should handle signup API failure gracefully", async () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);

    // Enter valid data into the form
    fireEvent.changeText(getByPlaceholderText("Full Name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Email"), "john.doe@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.changeText(getByPlaceholderText("Phone Number"), "1234567890");

    // Mock the signup API to reject with an error
    signup.mockRejectedValueOnce(new Error("Email already exists"));

    // Simulate pressing the signup button
    fireEvent.press(getByText("Sign Up"));

    // Wait for the error handling to complete
    await waitFor(() => expect(getByText("Email already exists")).toBeTruthy());
  });

  it("should navigate to LoginPage when 'Log in' link is pressed", () => {
    const { getByText } = render(<Signup />);

    // Simulate pressing the "Log in" link
    fireEvent.press(getByText("Log in"));

    // Expect the navigate function to be called with "LoginPage"
    expect(navigate).toHaveBeenCalledWith("LoginPage");
  });
});
