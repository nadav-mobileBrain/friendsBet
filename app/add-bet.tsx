import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "../lib/colors";
import AppButton from "../components/AppButton";
import ErrorField from "../components/ErrorField";
import * as Yup from "yup";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

// Define the validation schema
const validationSchema = Yup.object().shape({
  betSubject: Yup.string().required("Bet subject is required"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  endDate: Yup.date()
    .required("End date is required")
    .min(new Date(), "End date must be in the future"),
});

export default function AddBet() {
  const [betSubject, setBetSubject] = useState("");
  const [amount, setAmount] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = {
        betSubject,
        amount: parseFloat(amount),
        endDate,
      };

      await validationSchema.validate(formData, { abortEarly: false });

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Insert the bet into Supabase
      const { data, error } = await supabase.from("bets").insert({
        user_id: user.id,
        bet_subject: formData.betSubject,
        amount: formData.amount,
        end_date: formData.endDate.toISOString(),
      });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to add bet: ${error.message}`);
      }

      console.log("Bet added successfully:", data);

      // Reset form fields after successful submission
      setBetSubject("");
      setAmount("");
      setEndDate(new Date());
      setErrors({});

      // Navigate to "All Bets"
      router.replace("/");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error("Error in handleSubmit:", error);
        setErrors({
          general: (error as Error).message || "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowDatePicker(Platform.OS === "ios");
    setEndDate(currentDate);
    setErrors((prev) => ({ ...prev, endDate: "" }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Bet</Text>
      <TextInput
        style={styles.input}
        placeholder="Bet Subject"
        value={betSubject}
        onChangeText={(text) => {
          setBetSubject(text);
          setErrors((prev) => ({ ...prev, betSubject: "" }));
        }}
        placeholderTextColor={colors.textSecondary}
      />
      <ErrorField error={errors.betSubject} />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={(text) => {
          setAmount(text);
          setErrors((prev) => ({ ...prev, amount: "" }));
        }}
        keyboardType="numeric"
        placeholderTextColor={colors.textSecondary}
      />
      <ErrorField error={errors.amount} />
      <AppButton
        title={`End Date: ${endDate.toLocaleDateString()}`}
        onPress={() => setShowDatePicker(true)}
        backgroundColor={colors.surface}
        color={colors.textPrimary}
        style={styles.dateButton}
      />
      <ErrorField error={errors.endDate} />
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={endDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChangeDate}
          minimumDate={new Date()} // Set minimum date to today
        />
      )}
      <ErrorField error={errors.general} />
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <AppButton
          title="Add Bet"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
    fontSize: 20,
  },
  dateButton: {
    marginBottom: 5,
  },
  submitButton: {
    marginTop: 20,
  },
});
