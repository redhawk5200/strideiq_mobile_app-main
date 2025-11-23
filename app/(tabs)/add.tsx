import { StyleSheet, Text, View } from "react-native";
export default function AddScreen() {
  return <View style={styles.c}><Text style={styles.t}>Add</Text></View>;
}
const styles = StyleSheet.create({ c:{flex:1,alignItems:"center",justifyContent:"center"}, t:{fontSize:18,fontWeight:"600"}});
