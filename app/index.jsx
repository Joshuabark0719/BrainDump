import { View, Text, Image, TextInput, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <LinearGradient
      colors={["#F8E6CF", "#BFDCDC"]}
      locations={[0, 0.9]}
      style={styles.container}
    >
      {/* Cat */}
      <Image
        source={require("../assets/cat.png")}
        style={styles.cat}
      />

      {/* Title */}
      <Text style={styles.title}>How was today?</Text>
      <Text style={styles.date}>{dateString}</Text>

      {/* Input Card */}
      <View style={styles.card}>
        <TextInput
          placeholder="What’s on your mind?"
          placeholderTextColor="#B0A79E"
          multiline
          style={styles.input}
        />

        <View style={styles.savedPill}>
          <Text style={styles.savedText}>✓ Saved</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  cat: {
    width: 96,
    height: 96,
    marginBottom: 24,
  },

  title: {
    fontFamily: "Nunito",
    fontSize: 18,
    color: "#8A8177",
    marginBottom: 4,
  },

  date: {
    fontFamily: "Nunito",
    fontSize: 14,
    color: "#A39A90",
    marginBottom: 36,
  },

  card: {
    width: "100%",
    minHeight: 180,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },

  input: {
    fontFamily: "Nunito",
    fontSize: 16,
    lineHeight: 24,
    color: "#5A5148",
    flex: 1,
  },

  savedPill: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },

  savedText: {
    fontFamily: "Nunito",
    fontSize: 12,
    color: "#B2A89E",
  },
});
