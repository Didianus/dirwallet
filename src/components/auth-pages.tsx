"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const { login, register, isLoading, error } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || error;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!loginEmail || !loginPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    await login(loginEmail, loginPassword);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (
      !registerName ||
      !registerEmail ||
      !registerPassword ||
      !registerConfirmPassword
    ) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (registerPassword.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    const success = await register(
      registerName,
      registerEmail,
      registerPassword,
    );
    if (success) {
      setIsLogin(true);
      setLocalError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-400/5 blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Card header */}
          <div className="p-8 pb-0 text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Wallet className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? "Dir Wallet" : "Create Account"}
            </h2>
            <p className="text-sm text-white/50 mt-1">
              {isLogin
                ? "Sign in to manage your finances"
                : "Start tracking your finances today"}
            </p>
          </div>

          {/* Error display */}
          <AnimatePresence>
            {displayError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-8 mt-4"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400">
                  {displayError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-white/70 text-xs"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-white/70 text-xs"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="register-name"
                      className="text-white/70 text-xs"
                    >
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-email"
                      className="text-white/70 text-xs"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-password"
                      className="text-white/70 text-xs"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-confirm-password"
                      className="text-white/70 text-xs"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerConfirmPassword}
                        onChange={(e) =>
                          setRegisterConfirmPassword(e.target.value)
                        }
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Toggle between login and register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/40">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setLocalError(null);
                  }}
                  className="ml-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
