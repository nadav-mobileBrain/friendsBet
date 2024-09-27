import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import AppButton from "../components/AppButton";
import colors from "../lib/colors";

export default function Account() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchUserData(session.user.id);
        router.replace("/");
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
    });
  }, []);

  const fetchUserData = async (userId: string) => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      setUser(user);
      setUsername(user?.user_metadata?.display_name || user?.email || "User");
    }
  };

  const handleAuthentication = async (isAnonymous = false) => {
    setLoading(true);
    try {
      if (isAnonymous) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        router.replace("/");
      } else {
        if (!email || !password || (isSignUp && !username)) {
          Alert.alert("Error", "Please fill in all fields");
          setLoading(false);
          return;
        }

        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: username,
              },
              // Remove the emailRedirectTo option
            },
          });
          if (error) throw error;
          if (data.user) {
            Alert.alert("Success", "Signed up successfully!");
            router.replace("/");
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          router.replace("/");
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      router.replace("/account");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!isAuthenticated ? (
        <>
          <Text style={styles.title}>
            {isSignUp ? "Create Account" : "Sign In"}
          </Text>
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleAuthentication()}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.anonymousButton]}
            onPress={() => handleAuthentication(true)}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : "Continue as Guest"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchText}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Account: {username}</Text>
          <AppButton
            title={loading ? "Processing..." : "Sign Out"}
            onPress={handleSignOut}
            disabled={loading}
            backgroundColor={colors.danger}
            style={styles.signOutButton}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  signOutButton: {
    marginTop: 20,
    color: colors.danger,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  anonymousButton: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchText: {
    marginTop: 20,
    color: "#007AFF",
  },
});
