"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { signInWithGoogle, signUpWithEmail } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useState } from "react"
import { HeaderGoBack } from "../../components/header-go-back"

export default function SignUpPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function handleSignInWithGoogle() {
    const supabase = createClient()

    if (!supabase) {
      throw new Error("Supabase is not configured")
    }

    try {
      setIsGoogleLoading(true)
      setError(null)

      const data = await signInWithGoogle(supabase)

      // Redirect to the provider URL
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      console.error("Error signing in with Google:", err)
      setError(
        (err as Error).message ||
          "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsGoogleLoading(false)
    }
  }

  async function handleSignUpWithEmail() {
    const supabase = createClient()

    if (!supabase) {
      setError("Supabase is not configured")
      return
    }

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    try {
      setIsEmailLoading(true)
      setError(null)
      setSuccess(null)

      const data = await signUpWithEmail(supabase, email, password)

      if (data?.user) {
        if (data.user.email_confirmed_at) {
          // Email is already confirmed, redirect to home
          window.location.href = "/"
        } else {
          // Email confirmation required
          setSuccess(
            `Please check your email (${email}) and click the confirmation link to complete your registration.`
          )
        }
      }
    } catch (err: unknown) {
      console.error("Error signing up with email:", err)
      setError(
        (err as Error).message ||
          "An error occurred during sign up. Please try again."
      )
    } finally {
      setIsEmailLoading(false)
    }
  }

  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <HeaderGoBack href="/auth/login" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-3">
              Sign up to get started with Rainscale Healthcare.
            </p>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 rounded-md p-3 text-sm">
              {success}
            </div>
          )}
          
          <div className="mt-8 space-y-6">
            {/* Email/Password Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSignUpWithEmail(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEmailLoading || isGoogleLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isEmailLoading || isGoogleLoading}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isEmailLoading || isGoogleLoading}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full text-base sm:text-base"
                size="lg"
                disabled={isEmailLoading || isGoogleLoading}
              >
                {isEmailLoading ? "Creating account..." : "Create account"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-foreground hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth */}
            <Button
              variant="secondary"
              className="w-full text-base sm:text-base"
              size="lg"
              onClick={handleSignInWithGoogle}
              disabled={isGoogleLoading || isEmailLoading}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google logo"
                width={20}
                height={20}
                className="mr-2 size-4"
              />
              <span>
                {isGoogleLoading ? "Connecting..." : "Continue with Google"}
              </span>
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        <p>
          By continuing, you agree to our{" "}
          <Link href="/" className="text-foreground hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/" className="text-foreground hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}