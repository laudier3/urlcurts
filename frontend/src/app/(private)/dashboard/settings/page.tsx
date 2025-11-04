"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Carrega o UserProfileManager apenas no cliente, sem SSR
const UserProfileManager = dynamic(
  () => import("../../components/UserProfileManager"),
  { ssr: false }
);

export default function SettingsPage() {
  // controla se o modal está visível
  const [showModal, setShowModal] = useState(true);

  if (!showModal) return null;

  return (
    <div className="p-8">
      {/* closeModal definido inline, só no cliente */}
      <UserProfileManager closeModal={() => setShowModal(false)} />
    </div>
  );
}
