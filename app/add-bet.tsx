import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "../lib/colors";
import AppButton from "../components/AppButton";
import * as Yup from "yup";

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

  const handleSubmit = async () => {
    try {
      const formData = {
        betSubject,
        amount: parseFloat(amount),
        endDate,
      };

      await validationSchema.validate(formData, { abortEarly: false });

      console.log(formData);
      // Reset form fields after successful submission
      setBetSubject("");
      setAmount("");
      setEndDate(new Date());
      setErrors({});
      Alert.alert("Success", "Bet added successfully!");
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
        console.error(error);
        Alert.alert("Error", "An unexpected error occurred");
      }
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
      {errors.betSubject && (
        <Text style={styles.errorText}>{errors.betSubject}</Text>
      )}
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
      {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
      <AppButton
        title={`End Date: ${endDate.toLocaleDateString()}`}
        onPress={() => setShowDatePicker(true)}
        backgroundColor={colors.surface}
        color={colors.textPrimary}
        style={styles.dateButton}
      />
      {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
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
      <AppButton
        title="Add Bet"
        onPress={handleSubmit}
        style={styles.submitButton}
      />
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
    fontSize: 24,
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
  },
  dateButton: {
    marginBottom: 5,
  },
  submitButton: {
    marginTop: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    marginBottom: 10,
  },
});
