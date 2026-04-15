// frontend/src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { authAPI, setAuthToken } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isSignedIn }         = useAuth();

  const [dbUser,   setDbUser]   = useState(null);
  const [syncing,  setSyncing]  = useState(false);
  const [error,    setError]    = useState(null);
  const [ready,    setReady]    = useState(false);
  const syncedRef               = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isUserLoaded || !isSignedIn || !user) return;
      if (syncedRef.current) return; // Prevent double sync

      try {
        setSyncing(true);
        setError(null);

        // Step 1 — get token
        const token = await getToken();

        if (!token) {
          throw new Error("Failed to get authentication token.");
        }

        // Step 2 — set token on axios BEFORE any API call
        setAuthToken(token);

        // Step 3 — sync user to MongoDB
        const email =
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress;

        const name =
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          email ||
          "User";

        const response = await authAPI.sync({
          clerkId: user.id,
          name,
          email,
        });

        setDbUser(response.data);
        syncedRef.current = true;
        setReady(true);

      } catch (err) {
        console.error("User sync failed:", err.message);
        setError(err.message);
        // Still set ready so UI doesn't hang
        setReady(true);
      } finally {
        setSyncing(false);
      }
    };

    syncUser();
  }, [isUserLoaded, isSignedIn, user]);

  // Clear on sign out
  useEffect(() => {
    if (isUserLoaded && !isSignedIn) {
      setAuthToken(null);
      setDbUser(null);
      setReady(false);
      syncedRef.current = false;
    }
  }, [isUserLoaded, isSignedIn]);

  // Refresh token every 50 seconds
  useEffect(() => {
    if (!isSignedIn) return;

    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
      } catch (err) {
        console.error("Token refresh failed:", err.message);
      }
    }, 50 * 1000);

    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return (
    <AuthContext.Provider
      value={{ dbUser, syncing, error, isReady: ready }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};