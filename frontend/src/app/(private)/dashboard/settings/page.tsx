"use client";
export const dynamic = "force-dynamic";

import UserProfileManager from "../../components/UserProfileManager";

export default function SettingsPage() {
  const handleCloseModal = () => {
    console.log("Modal fechado");
  };

  return (
    <div className="p-8">
      <UserProfileManager closeModal={handleCloseModal} />
    </div>
  );
}
