import { Tabs, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import colors from "../lib/colors";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    // Add any custom fonts here
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background }}
      onLayout={onLayoutRootView}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray500,
          tabBarStyle: { backgroundColor: colors.surface },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "All Bets",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (!session) {
                e.preventDefault();
                router.push("/account");
              }
            },
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: session ? "Profile" : "Sign In",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
