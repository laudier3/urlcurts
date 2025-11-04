"use client"; // garante renderização apenas no cliente

import { useState } from "react";
import dynamic from "next/dynamic";

// Importa UserProfileManager somente no cliente, sem SSR
const UserProfileManager = dynamic(
  () => import("../../components/UserProfileManager"),
  { ssr: false }
);

export default function SettingsPage() {
  const [showModal, setShowModal] = useState(true);

  // Evita renderizar nada se o modal estiver fechado
  if (!showModal) return null;

  return (
    <div className="p-8">
      {/* closeModal definido inline no cliente */}
      <UserProfileManager closeModal={() => setShowModal(false)} />
    </div>
  );
}
