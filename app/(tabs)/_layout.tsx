"use client";

import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

// SVGs
import ActivityIcon from "../../assets/dashboard/activity.svg";
import HomeIcon from "../../assets/dashboard/home.svg";
import PlusIcon from "../../assets/dashboard/plus.svg";
import StatsIcon from "../../assets/dashboard/Progress.svg";
import SettingsIcon from "../../assets/dashboard/settings.svg";

//unfilled SVGs
import ActivityIconUnfilled from "../../assets/dashboard/activityunfilled.svg";
import HomeIconUnfilled from "../../assets/dashboard/homeunfilled.svg";
import StatsIconUnfilled from "../../assets/dashboard/Progressunfilled.svg";
import SettingsIconUnfilled from "../../assets/dashboard/settingsunfilled.svg";

const ACTIVE = "#175CD3";
const INACTIVE = "#343330";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <HomeIcon width={35} height={35} color={ACTIVE} fill={ACTIVE} />
            ) : (
              <HomeIconUnfilled
                width={35}
                height={35}
                color={INACTIVE}
                fill="none"
              />
            ),
          tabBarStyle: {
            height: 100,
            paddingBottom: 20,
            paddingTop: 10,
          },
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <ActivityIcon
                width={35}
                height={35}
                color={ACTIVE}
                fill={ACTIVE}
              />
            ) : (
              <ActivityIconUnfilled
                width={35}
                height={35}
                color={INACTIVE}
                fill="none"
              />
            ),
        }}
      />

      {/* Center tab: no label + bigger icon */}
      <Tabs.Screen
        name="add"
        options={{
          title: "", // no title
          tabBarLabel: () => null, // hides "Add" label just for this tab
          tabBarIcon: ({ focused }) => (
            <PlusIcon
              width={44} // bigger icon
              height={44}
              style={{ marginTop: 15 }} // adjust vertical alignment
              color={focused ? ACTIVE : INACTIVE}
              fill={focused ? ACTIVE : "none"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: "Progress",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <StatsIcon width={35} height={35} color={ACTIVE} fill={ACTIVE} />
            ) : (
              <StatsIconUnfilled
                width={35}
                height={35}
                color={INACTIVE}
                fill="none"
              />
            ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Setting",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <SettingsIcon
                width={35}
                height={35}
                color={ACTIVE}
                fill={ACTIVE}
              />
            ) : (
              <SettingsIconUnfilled
                width={35}
                height={35}
                color={INACTIVE}
                fill="none"
              />
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 100,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },
  tabBarItem: {
    borderTopWidth: 3,
    borderTopColor: "transparent",
  },
});
