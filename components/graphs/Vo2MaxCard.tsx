import { useFont } from "@shopify/react-native-skia"
import React from "react"
import { View } from "react-native"
import { CartesianChart, Line, Scatter } from "victory-native"

type Props = { width: number }

const days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"]

const vo2Data = [
  { x: 1, y: 42.8 },
  { x: 2, y: 41.2 },
  { x: 3, y: 42.4 },
  { x: 4, y: 40.7 },
  { x: 5, y: 45.0 },
  { x: 6, y: 42.3 },
  { x: 7, y: 45.0 },
]

export default function Vo2MaxCard({ width }: Props) {
  const font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"), 10)

  return (
    <View style={{ width, backgroundColor: "#ECFDF3", borderRadius: 12, padding: 14 }}>
      

      <View style={{ height: 220, width: "100%" }}>
        <CartesianChart
          data={vo2Data}
          xKey="x"
          yKeys={["y"]}
          // widen x-domain like the bars so edges don't clip, and add a bit of y headroom
          domain={{ x: [0.5, 7.5], y: [40, 46] }}
          padding={{ top: 6, right: 28, bottom: 22, left: 36 }}
          xAxis={{
            font,
            tickValues: [1, 2, 3, 4, 5, 6, 7],
            formatXLabel: (v) => days[(v as number) - 1] ?? "",
            lineColor: "#D1D5DB",
            labelColor: "#6B7280",
          }}
          yAxis={[{ font }]}
        >
          {({ points }) => (
            <>
              <Line points={points.y} curveType="monotoneX" color="#12B76A" strokeWidth={3} />
              <Scatter points={points.y} radius={3.5} color="#12B76A" />
            </>
          )}
        </CartesianChart>
      </View>
    </View>
  )
}
