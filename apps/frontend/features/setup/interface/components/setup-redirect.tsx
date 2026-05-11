"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSetupStatus } from "../../infrastructure/setup-api";

export function SetupRedirect() {
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    void getSetupStatus({ signal: controller.signal })
      .then((status) => {
        if (!status.setup?.configured) router.replace("/setup");
      })
      .catch(() => {
        router.replace("/setup");
      });
    return () => controller.abort();
  }, [router]);

  return null;
}
