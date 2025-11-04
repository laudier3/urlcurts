"use client"; // garante que tudo abaixo é client

import { useState } from "react";
import dynamic from "next/dynamic";

// Impede SSR do UserProfileManager
const UserProfileManager = dynamic(
  () => import("../../components/UserProfileManager"),
  { ssr: false }
);

export default function SettingsPage() {
  const [showModal, setShowModal] = useState(true);

  if (!showModal) return null;

  return (
    <div className="p-8">
      <UserProfileManager closeModal={() => setShowModal(false)} />
    </div>
  );
}
