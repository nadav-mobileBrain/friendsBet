import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import colors from "../lib/colors";

interface Bet {
  id: string;
  bet_subject: string;
  amount: number;
  end_date: string;
}

export default function AllBets() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);

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

        // Fetch bets from the 'bets' table
        const { data, error } = await supabase
          .from("bets")
          .select("*")
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error fetching bets:", error);
        } else {
          setBets(data);
        }
      }
    };

    checkSession();
  }, []);

  const renderItem = ({ item }: { item: Bet }) => (
    <View style={styles.betItem}>
      <Text style={styles.betSubject}>{item.bet_subject}</Text>
      <Text style={styles.betAmount}>Amount: ${item.amount}</Text>
      <Text style={styles.betEndDate}>
        End Date: {new Date(item.end_date).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {userName && (
          <Text style={[styles.userName, { color: colors.secondary }]}>
            {userName}
          </Text>
        )}
      </View>
      <Text style={[styles.title, { color: colors.primary }]}>
        All Bets (Protected Route)
      </Text>
      <FlatList
        data={bets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.betList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  betList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  betItem: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  betSubject: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  betAmount: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  betEndDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
