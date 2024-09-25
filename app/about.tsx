import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function About() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>This is the About page</Text>
      <Link href="/">Go back to Home</Link>
    </View>
  );
}
