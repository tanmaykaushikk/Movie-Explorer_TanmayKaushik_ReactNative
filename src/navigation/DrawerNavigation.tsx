import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomePage from "../screens/HomePage";
import Login from "../screens/Login";
import Signup from "../screens/Signup";
import PremiumScreen from "../screens/PremiumScreen";
import CustomDrawerContent from "../components/CustomDrawerContent";
import Profile from "../screens/Profile";
// import AdminScreen from "../screens/AdminScreen";

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        overlayColor: "transparent",
      }}
    >
      <Drawer.Screen name="Home" component={HomePage} />
      <Drawer.Screen name="Login" component={Login} />
      <Drawer.Screen name="Signup" component={Signup} />
      <Drawer.Screen name="Premium" component={PremiumScreen} />
      <Drawer.Screen name="Profile" component={Profile} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
