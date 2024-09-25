import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import colors from "../lib/colors";

export default function AllBets() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/account");
      } else {
        // Get the user's name from the session
        const displayName = session.user.user_metadata.display_name;
        const email = session.user.email;
        setUserName(displayName || email || "Guest User");
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      {userName && (
        <Text style={[styles.welcomeText, { color: colors.secondary }]}>
          Welcome, {userName}!
        </Text>
      )}
      <Text style={[styles.title, { color: colors.primary }]}>
        All Bets (Protected Route)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
