import { StyleSheet, View } from "react-native"

interface PlaceholderChartProps {
  type: "line" | "bar"
  color: string
}

export default function PlaceholderChart({ type, color }: PlaceholderChartProps) {
  if (type === "line") {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.lineChart}>
          {[...Array(7)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.linePoint,
                {
                  backgroundColor: color,
                  height: Math.random() * 30 + 10,
                  marginTop: Math.random() * 20,
                },
              ]}
            />
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barChart}>
        {[...Array(7)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: color,
                height: Math.random() * 40 + 20,
                opacity: 0.7 + Math.random() * 0.3,
              },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chartContainer: {
    height: 80,
    marginTop: 8,
  },
  lineChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
    paddingHorizontal: 4,
  },
  linePoint: {
    width: 3,
    borderRadius: 2,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
    paddingHorizontal: 4,
  },
  bar: {
    width: 8,
    borderRadius: 2,
  },
})
