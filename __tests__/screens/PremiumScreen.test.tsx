import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PremiumScreen from "../../src/screens/PremiumScreen"; // Adjust the path as per your project structure
import { useNavigation } from "@react-navigation/native";

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

describe("PremiumScreen", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigation.mockReturnValue({
      navigate: mockNavigate,
    });
  });

  it("renders the PremiumScreen correctly", async () => {
    const { getByTestId, getByText } = render(<PremiumScreen />);

    // Check if header texts are present
    expect(getByText("PREMIUM")).toBeTruthy();
    expect(getByText("Upgrade Your Experience")).toBeTruthy();
    expect(getByText("No commitment. Cancel anytime.")).toBeTruthy();

    // Check if plan options are rendered
    expect(getByTestId("plan-Standard")).toBeTruthy();
    expect(getByTestId("plan-Premium")).toBeTruthy();

    // Check for the 30-day money back guarantee text
    expect(getByText("✓ 30-day money back guarantee")).toBeTruthy();
  });

  it("navigates to Checkout screen when 'Subscribe Now' is pressed for Premium plan", async () => {
    const { getByTestId } = render(<PremiumScreen />);

    // Find the subscribe button for Premium plan and fire the press event
    fireEvent.press(getByTestId("subscribe-Premium"));

    // Wait for the navigation to happen
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Checkout");
    });
  });

  it("navigates to Checkout screen when 'Subscribe Now' is pressed for Standard plan", async () => {
    const { getByTestId } = render(<PremiumScreen />);

    // Find the subscribe button for Standard plan and fire the press event
    fireEvent.press(getByTestId("subscribe-Standard"));

    // Wait for the navigation to happen
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Checkout");
    });
  });

  it("renders Premium plan with 'MOST POPULAR' badge", async () => {
    const { getByTestId } = render(<PremiumScreen />);

    // Check if the Premium plan has the 'MOST POPULAR' badge
    const popularBadge = getByTestId("popularBadge");
    expect(popularBadge).toBeTruthy();
  });

  it("renders Standard plan without 'MOST POPULAR' badge", async () => {
    const { queryByTestId } = render(<PremiumScreen />);

    // Ensure that the Standard plan does not have the 'MOST POPULAR' badge
    const popularBadge = queryByTestId("popularBadge");
    expect(popularBadge).toBeNull();
  });

  it("renders all features for the Premium plan correctly", () => {
    const { getByText } = render(<PremiumScreen />);

    // Check if all the features for Premium are displayed
    expect(getByText("• All Basic Features")).toBeTruthy();
    expect(getByText("• Premium Quality")).toBeTruthy();
    expect(getByText("• Multi-Device Support")).toBeTruthy();
    expect(getByText("• Priority Customer Service")).toBeTruthy();
    expect(getByText("• Exclusive Content Access")).toBeTruthy();
  });

  it("renders all features for the Standard plan correctly", () => {
    const { getByText } = render(<PremiumScreen />);

    // Check if all the features for Standard are displayed
    expect(getByText("• Basic Features Access")).toBeTruthy();
    expect(getByText("• Standard Quality")).toBeTruthy();
    expect(getByText("• Ad-free Experience")).toBeTruthy();
    expect(getByText("• Single Device Support")).toBeTruthy();
  });

  it("displays the correct gradient background for Premium plan", () => {
    const { getByTestId } = render(<PremiumScreen />);

    // Ensure the Premium plan has the correct gradient style based on being popular
    const planBox = getByTestId("plan-Premium");
    expect(planBox.props.style[0].colors).toEqual(["#333", "#222", "#111"]); // Check for gradient colors for popular plan
  });

  it("displays the correct gradient background for Standard plan", () => {
    const { getByTestId } = render(<PremiumScreen />);

    // Ensure the Standard plan has a different gradient style based on not being popular
    const planBox = getByTestId("plan-Standard");
    expect(planBox.props.style[0].colors).toEqual(["#222", "#1a1a1a", "#0d0d0d"]); // Check for gradient colors for standard plan
  });

  it("displays the 30-day money back guarantee", () => {
    const { getByText } = render(<PremiumScreen />);

    // Ensure that the money back guarantee text is shown
    expect(getByText("✓ 30-day money back guarantee")).toBeTruthy();
  });
});
