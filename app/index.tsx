import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import colors from "../lib/colors";
import { Alert } from "react-native";

interface Bet {
  id: string;
  bet_subject: string;
  amount: number;
  end_date: string;
  second_user_id: string | null;
  user_id: string; // Add this line
}

export default function AllBets() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/account");
      } else {
        const displayName = session.user.user_metadata.display_name;
        const email = session.user.email;
        setUserName(displayName || email || "Guest User");
        setUserId(session.user.id);

        await logUserSession(); // Add this line
        fetchBets();
      }
    };

    checkSession();
  }, []); // Remove the dependency on bets

  const fetchBets = async () => {
    console.log("Fetching bets...");
    const { data, error } = await supabase
      .from("bets")
      .select("id, bet_subject, amount, end_date, second_user_id, user_id")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching bets:", error);
      Alert.alert("Error", "Failed to fetch bets. Please try again.");
    } else {
      console.log("Fetched bets:", JSON.stringify(data, null, 2));
      setBets(data);
    }
  };

  const handleAcceptBet = async (betId: string) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to accept a bet.");
      return;
    }

    console.log("Attempting to accept bet:", betId);
    console.log("Current user ID:", userId);

    // Proceed with the update
    const { data, error } = await supabase
      .from("bets")
      .update({ second_user_id: userId })
      .eq("id", betId)
      .is("second_user_id", null)
      .neq("user_id", userId) // Add this line to ensure user can't accept their own bet
      .select();

    console.log("Update result:", { data, error });

    if (error) {
      console.error("Error accepting bet:", error);
      Alert.alert("Error", `Failed to accept the bet. Error: ${error.message}`);
    } else if (data && data.length > 0) {
      Alert.alert("Success", "You have successfully accepted the bet!");
      fetchBets();
    } else {
      console.log("No data returned from update operation");
      Alert.alert(
        "Error",
        "Failed to accept the bet. It may have been accepted by someone else or you might be trying to accept your own bet. Please refresh and try again."
      );
      fetchBets();
    }
  };

  const renderItem = ({ item }: { item: Bet }) => (
    <View style={styles.betItem}>
      <Text style={styles.betSubject}>{item.bet_subject}</Text>
      <Text style={styles.betAmount}>Amount: ${item.amount}</Text>
      <Text style={styles.betEndDate}>
        End Date: {new Date(item.end_date).toLocaleDateString()}
      </Text>
      {item.second_user_id ? (
        <Text style={styles.betStatus}>
          Accepted by: {item.second_user_id === userId ? "You" : "Another user"}
        </Text>
      ) : item.user_id !== userId ? (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptBet(item.id)}>
          <Text style={styles.acceptButtonText}>Accept Bet</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.betStatus}>Your bet (waiting for acceptance)</Text>
      )}
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
        <TouchableOpacity onPress={fetchBets} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { color: colors.primary }]}>All Bets</Text>
      <FlatList
        data={bets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.betList}
      />
      <TouchableOpacity
        style={styles.addBetButton}
        onPress={() => router.push("/add-bet")}>
        <Text style={styles.addBetButtonText}>Add New Bet</Text>
      </TouchableOpacity>
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
    color: colors.tertiary,
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
  betStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  acceptButtonText: {
    color: colors.background,
    fontWeight: "bold",
  },
  refreshButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  refreshButtonText: {
    color: colors.background,
    fontWeight: "bold",
  },
  addBetButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  addBetButtonText: {
    color: colors.background,
    fontWeight: "bold",
    fontSize: 16,
  },
});

const logUserSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("Current user session:", JSON.stringify(session, null, 2));
};
