"use client"

import { useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import ContactMethodManager from "./ContactMethodManager"

type Method = "sms" | "email" | "call"

export default function ManageContactMethod() {
  const { method } = useLocalSearchParams<{ method: Method }>()
  const [phones, setPhones] = useState<string[]>(["+92 333 222 1110"])
  const [emails, setEmails] = useState<string[]>(["saniakhan@gmail.com"])
  const [calls, setCalls] = useState<string[]>(["+92 300 000 0000"])

  if (method === "email") {
    return (
      <ContactMethodManager
        title="Via Email"
        addLabel="Add Email"
        leadingIcon="mail-outline"
        inputPlaceholder="name@example.com"
        keyboardType="email-address"
        items={emails}
        onAdd={(v) => setEmails((p) => [v, ...p])}
        onEdit={(i, v) => setEmails((p) => p.map((x, idx) => (idx === i ? v : x)))}
        displayFormat={(v) => v} // or mask if you prefer
      />
    )
  }

  if (method === "call") {
    return (
      <ContactMethodManager
        title="Via Phone Call"
        addLabel="Add Number"
        leadingIcon="call-outline"
        inputPlaceholder="+92 300 000 0000"
        keyboardType="phone-pad"
        items={calls}
        onAdd={(v) => setCalls((p) => [v, ...p])}
        onEdit={(i, v) => setCalls((p) => p.map((x, idx) => (idx === i ? v : x)))}
      />
    )
  }

  // default to SMS
  return (
    <ContactMethodManager
      title="Via SMS"
      addLabel="Add Number"
      leadingIcon="chatbubble-ellipses-outline"
      inputPlaceholder="+92 333 222 1110"
      keyboardType="phone-pad"
      items={phones}
      onAdd={(v) => setPhones((p) => [v, ...p])}
      onEdit={(i, v) => setPhones((p) => p.map((x, idx) => (idx === i ? v : x)))}
    />
  )
}
