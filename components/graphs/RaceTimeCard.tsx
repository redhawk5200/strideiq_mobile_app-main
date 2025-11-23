import { useFont } from "@shopify/react-native-skia";
import React from "react";
import { Image, Text, View } from "react-native";
import { CartesianChart, StackedBar } from "victory-native"; // XL API

type Props = { width: number }

const dayLabels = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"]

// minutes per day (two stacked series)
const light = [45, 45, 48, 0, 32, 25, 22]
const dark  = [ 0, 10, 12, 65, 13,  0,  0]

// One row per x with all series as keys
const data = light.map((l, i) => ({ x: i + 1, light: l, dark: dark[i] }))

export default function RaceTimeCard({ width }: Props) {
  const font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"), 10)

  // --- Fix #1: make sure Y domain fits stacked sums (no overflow)
  const maxStack = data.reduce((m, d) => Math.max(m, (d.light ?? 0) + (d.dark ?? 0)), 0)
  const yMax = Math.ceil(maxStack / 10) * 10 // round up to nearest 10

  return (
    <View style={{ width, backgroundColor: "#FFF6ED", borderRadius: 12, padding: 14 }}>
      
      <View style={{ height: 220, width: "100%" }}>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={["light", "dark"]}
          // --- Fix #2: widen x-domain so edge bars are fully visible
          domain={{ x: [0.5, 7.5], y: [0, yMax] }}
          // --- Fix #3: more right padding so "Sun" label isn't clipped
          padding={{ top: 6, right: 28, bottom: 22, left: 36 }}
          xAxis={{
            font,
            tickValues: [1, 2, 3, 4, 5, 6, 7],
            formatXLabel: (v) => dayLabels[(v as number) - 1] ?? "",
            lineColor: "#D1D5DB",
            labelColor: "#6B7280",
          }}
          yAxis={[{ font }]}
        >
          {({ points, chartBounds }) => {
            // responsive bar width from bounds
            const widthPx = chartBounds.right - chartBounds.left
            const per = widthPx / 7
            const barWidth = Math.min(28, Math.max(10, per * 0.6))

            return (
                <StackedBar
                points={[points.light, points.dark]}
                chartBounds={chartBounds}
                colors={["#FFDBBD", "#FEB273"]}
                barOptions={({ isTop }) => ({
                  barWidth,
                  roundedCorners: isTop ? { topLeft: 6, topRight: 6 } : undefined,
                })}
              />
            )
          }}
        </CartesianChart>
      </View>
    </View>
  )
}
