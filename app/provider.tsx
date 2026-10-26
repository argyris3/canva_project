"use client";
import { UserDetailContext } from "../context/UserDetailContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState } from "react";

function Provider({ children }: { children: React.ReactNode }) {
  const [userDetail, setUserDetail] = useState<any>();
  const { isLoaded, user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    if (!isLoaded || !userId) {
      setUserDetail(undefined);
      return;
    }

    let cancelled = false;

    const createNewUser = async () => {
      try {
        // Only authenticated users can have database-backed user details.
        const result = await axios.post("/api/users");
        if (!cancelled) {
          setUserDetail(result.data);
        }
      } catch (error) {
        console.error("Failed to initialize user details:", error);
      }
    };

    void createNewUser();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
