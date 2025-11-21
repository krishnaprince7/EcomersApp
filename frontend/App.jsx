import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import Login from "./src/screens/Login";
import HomeSeller from "./src/screens/seller/HomeSeller";
import AdminHome from "./src/screens/admin/AdminHome";
import EditSeller from "./src/screens/seller/EditSeller";
import UsersHome from "./src/screens/users/UsersHome";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const PERSISTENCE_KEY = "NAVIGATION_STATE_V1";

if (__DEV__) {
  require("./ReactotronConfig");
}

export default function AppNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        if (__DEV__) {
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } catch (e) {
        console.log("Failed to restore navigation state", e);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer
        initialState={initialState}
        onStateChange={(state) => {
       
          if (__DEV__) {
            AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
          }
        }}
      >
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            options={{ headerShown: false }}
            name="Login"
            component={Login}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="HomeSeller"
            component={HomeSeller}
          />
          
          <Stack.Screen
            options={{ headerShown: false }}
            name="EditSeller"
            component={EditSeller}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="AdminHome"
            component={AdminHome}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="UsersHome"
            component={UsersHome}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
