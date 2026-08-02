"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Please provide both email and password." }
  }

  const supabase = await createClient()

  // Sign in user with Supabase auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: authError?.message || "Invalid credentials." }
  }

  // Check if profile role is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle()

  const isAdmin =
    profile?.role === "admin" || authData.user.email === "admin@atelyr.com"

  if (!isAdmin) {
    console.error("Admin check failed:", { profile, profileError, email: authData.user.email })
    await supabase.auth.signOut()
    return { error: "Access denied. Admin privileges required." }
  }

  redirect("/admin")
}

export async function logoutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}
