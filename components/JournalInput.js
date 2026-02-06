import { View, TextInput, StyleSheet } from "react-native";

export default function JournalInput() {
  return (
    <View style={styles.card}>
      <TextInput
        placeholder="Start typing… no pressure."
        placeholderTextColor="#999"
        multiline
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFDF8",
    borderRadius: 20,
    padding: 16,
    minHeight: 160,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
  },
});
