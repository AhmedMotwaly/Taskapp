"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc"; // npm install react-icons
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function GoogleButton() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // This triggers the standard Google Login window
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <button
      onClick={loginWithGoogle}
      disabled={isLoading}
      className="relative w-full flex items-center justify-center gap-3 bg-white text-black font-bold h-12 rounded-lg hover:bg-gray-200 hover:scale-[1.02] transition-all duration-200 disabled:opacity-70"
    >
      {isLoading ? (
        <Loader2 className="animate-spin text-black" size={20} />
      ) : (
        <>
          <FcGoogle size={24} />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}