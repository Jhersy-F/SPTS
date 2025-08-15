"use server";

import { signOut } from "@/lib/auth";
import ROUTES from "@/constants/routes";

export async function handleLogout() {
  await signOut({ redirectTo: ROUTES.HOME });
}
