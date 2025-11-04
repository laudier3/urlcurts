"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Não há conflito porque a importação é usada com outro nome
const UserProfileManager = dynamic(
  () => import("../../components/UserProfileManager"),
  { ssr: false } // garante renderização apenas no cliente
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
