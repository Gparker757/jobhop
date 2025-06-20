import { useState, useEffect } from "react";

export function useUserData() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("jobhop-user-data");
    if (data) setUserData(JSON.parse(data));
  }, []);

  return userData;
} 