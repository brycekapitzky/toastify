'use client'

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form@7.55.0";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { useAuth } from "./AuthContext";
import { loginSchema, signUpSchema, type LoginFormData, type SignUpFormData } from "../schemas/auth";

interface AuthPageProps {
  onBackToLanding: () => void;
  onTryDemo: () => void;
  initialMode?: "login" | "signup";
}

export function AuthPage({ onBackToLanding, onTryDemo, initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Sign up form
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const currentForm = mode === "login" ? loginForm : signUpForm;

  const handleSubmit = async (data: LoginFormData | SignUpFormData) => {
    setAuthError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        if (mode === "login") {
          const { email, password } = data as LoginFormData;
          const { error } = await signIn(email, password);
          
          if (error) {
            setAuthError(error.message);
          }
        } else {
          const { fullName, email, password } = data as SignUpFormData;
          const { error, data: authData } = await signUp(email, password, fullName);
          
          if (error) {
            setAuthError(error.message);
          } else if (authData?.user && !authData?.session) {
            setSuccessMessage(
              "Please check your email for a verification link to complete your account setup."
            );
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        setAuthError("An unexpected error occurred. Please try again.");
      }
    });
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setAuthError(null);
    startTransition(async () => {
      try {
        if (provider === "google") {
          await signInWithGoogle();
        } else {
          await signInWithGitHub();
        }
      } catch (error: any) {
        setAuthError(error.message || `Failed to sign in with ${provider}`);
      }
    });
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setAuthError(null);
    setSuccessMessage(null);
    currentForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            onClick={onBackToLanding}
            className="mb-4 text-slate-600 hover:text-slate-900"
            disabled={isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Toastify</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Sign In to Your Account" : "Create Your Account"}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {mode === "login"
                ? "Welcome back! Please enter your details."
                : "Get started with your free trial today."}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error/Success Messages */}
            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Social Sign In */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => handleSocialSignIn("google")}
                disabled={isPending}
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => handleSocialSignIn("github")}
                disabled={isPending}
              >
                <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form
              onSubmit={currentForm.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Full Name - Only for signup */}
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      {...signUpForm.register("fullName")}
                      disabled={isPending}
                    />
                  </div>
                  {signUpForm.formState.errors.fullName && (
                    <p className="text-sm text-red-600">
                      {signUpForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...currentForm.register("email")}
                    disabled={isPending}
                  />
                </div>
                {currentForm.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {currentForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...currentForm.register("password")}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
                {currentForm.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {currentForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password - Only for signup */}
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      {...signUpForm.register("confirmPassword")}
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isPending}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {signUpForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isPending}
              >
                {isPending
                  ? "Loading..."
                  : mode === "login"
                  ? "Sign In to Toastify"
                  : "Create Account & Start Free Trial"}
              </Button>
            </form>

            {/* Benefits for Signup */}
            {mode === "signup" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">
                  What's included in your free trial:
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ 2,500 free contacts</li>
                  <li>✓ Unlimited sequences</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            )}

            {/* Mode Toggle */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={toggleMode}
                className="text-slate-600 hover:text-slate-900"
                disabled={isPending}
              >
                {mode === "login"
                  ? "Don't have an account? Sign up free"
                  : "Already have an account? Sign in"}
              </Button>
            </div>

            {/* Demo Mode */}
            <div className="relative">
              <Separator />
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={onTryDemo}
              disabled={isPending}
            >
              <span className="mr-2">🎮</span>
              Try Interactive Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}