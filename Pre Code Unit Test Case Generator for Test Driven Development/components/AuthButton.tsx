"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthButtonProps {
  email: string;
}

export function AuthButton({ email }: AuthButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="auth-user-bar">
      <span className="auth-user-avatar" title={email}>
        {email.charAt(0).toUpperCase()}
      </span>
      <span className="auth-user-email">{email}</span>
      <button
        type="button"
        className="auth-signout-btn"
        onClick={() => void handleSignOut()}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M10 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Logout
      </button>
    </div>
  );
}
