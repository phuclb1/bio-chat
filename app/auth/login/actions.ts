"use server"

import { toast } from "@/components/ui/toast"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signInWithEmailAction(
  email: string,
  password: string
) {
  if (!isSupabaseEnabled) {
    return { error: "Authentication is not supported in this deployment" }
  }

  const supabase = await createClient()

  if (!supabase) {
    return { error: "Authentication is not supported in this deployment" }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })

    if (error) {
      return { error: error.message }
    }

    if (data?.user) {
      revalidatePath("/", "layout")
      redirect("/")
    }

    return { success: true, data }
  } catch (err) {
    console.error("Error signing in with email:", err)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUpWithEmailAction(
  email: string,
  password: string
) {
  if (!isSupabaseEnabled) {
    return { error: "Authentication is not supported in this deployment" }
  }

  const supabase = await createClient()

  if (!supabase) {
    return { error: "Authentication is not supported in this deployment" }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    console.error("Error signing up with email:", err)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  if (!isSupabaseEnabled) {
    toast({
      title: "Sign out is not supported in this deployment",
      status: "info",
    })
    return
  }

  const supabase = await createClient()

  if (!supabase) {
    toast({
      title: "Sign out is not supported in this deployment",
      status: "info",
    })
    return
  }

  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/login")
}
