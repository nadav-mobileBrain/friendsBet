import React from "react";
import { Text, StyleSheet } from "react-native";
import colors from "../lib/colors";

interface ErrorFieldProps {
  error?: string;
}

const ErrorField: React.FC<ErrorFieldProps> = ({ error }) => {
  if (!error) return null;

  return <Text style={styles.errorText}>{error}</Text>;
};

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 10,
    marginTop: -5,
  },
});

export default ErrorField;
