import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "../services/firebase.js";

const AuthContext = createContext({
  user: null,
  userProfile: null,
  subscriptionPlan: "Free",
  loading: true,
  logout: async () => {},
  upgradeToPaid: async () => {},
  downgradeToFree: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState("Free");
  const [loading, setLoading] = useState(true);

  // Helper to ensure profile exists and read it
  const syncUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser || !db) {
      setUserProfile(null);
      setSubscriptionPlan("Free");
      return;
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        const plan = (data.subscriptionPlan || "Free").toLowerCase() === "paid" ? "Paid" : "Free";
        setSubscriptionPlan(plan);
      } else {
        const initial = {
          fullName: firebaseUser.displayName || "Community Member",
          displayName: firebaseUser.displayName || "Community Member",
          email: firebaseUser.email || "",
          subscriptionPlan: "Free",
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, initial, { merge: true });
        setUserProfile(initial);
        setSubscriptionPlan("Free");
      }
    } catch (err) {
      console.warn("Could not sync user profile from Firestore:", err);
      setSubscriptionPlan("Free");
    }
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false);
      return undefined;
    }

    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser && db) {
        const userRef = doc(db, "users", currentUser.uid);
        unsubscribeSnapshot = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserProfile(data);
              const plan = (data.subscriptionPlan || "Free").toLowerCase() === "paid" ? "Paid" : "Free";
              setSubscriptionPlan(plan);
            } else {
              syncUserProfile(currentUser);
            }
            setLoading(false);
          },
          (err) => {
            console.warn("Firestore snapshot error on user doc:", err);
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
        setUserProfile(null);
        setSubscriptionPlan("Free");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [syncUserProfile]);

  const logout = async () => {
    if (auth) {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setSubscriptionPlan("Free");
    }
  };

  const upgradeToPaid = async (cardDetails = {}) => {
    if (!user || !db) {
      throw new Error("Please log in to upgrade your subscription plan.");
    }
    const userRef = doc(db, "users", user.uid);
    const updateData = {
      subscriptionPlan: "Paid",
      subscriptionPrice: 9.99,
      subscriptionCurrency: "USD",
      subscriptionStatus: "active",
      subscriptionUpdatedAt: new Date().toISOString(),
      cardLastFour: cardDetails.cardLastFour || "4242",
      ...(cardDetails.cardName ? { cardHolderName: cardDetails.cardName } : {}),
    };
    await setDoc(userRef, updateData, { merge: true });
    setSubscriptionPlan("Paid");
    setUserProfile((prev) => ({ ...prev, ...updateData }));
    return updateData;
  };

  const downgradeToFree = async () => {
    if (!user || !db) {
      throw new Error("Please log in to manage your subscription plan.");
    }
    const userRef = doc(db, "users", user.uid);
    const updateData = {
      subscriptionPlan: "Free",
      subscriptionStatus: "inactive",
      subscriptionUpdatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, updateData, { merge: true });
    setSubscriptionPlan("Free");
    setUserProfile((prev) => ({ ...prev, ...updateData }));
    return updateData;
  };

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        subscriptionPlan,
        loading,
        logout,
        upgradeToPaid,
        downgradeToFree,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
