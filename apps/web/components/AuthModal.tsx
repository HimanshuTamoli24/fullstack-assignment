"use client";

import React, { useState } from "react";
import { useAuth } from "~/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Sparkles, Shield, User as UserIcon, Loader2, ArrowRight } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { login, register, quickDemoLogin, demoUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<"demo" | "login" | "register">("demo");
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [regJobTitle, setRegJobTitle] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(loginEmail, loginPassword);
    setLoading(false);
    if (success) onOpenChange(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await register({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      jobTitle: regJobTitle || (regRole === "ADMIN" ? "Engineering Lead" : "Software Engineer"),
    });
    setLoading(false);
    if (success) onOpenChange(false);
  };

  const handleDemoClick = async (userId: string) => {
    setLoading(true);
    const success = await quickDemoLogin(userId);
    setLoading(false);
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/70 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/5 p-6 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-xs">
                TF
              </span>
              <DialogTitle className="text-xl font-bold">Welcome to TaskFlow</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Sign in with your credentials or select a pre-seeded test persona for instant role
              evaluation.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-5">
              <TabsTrigger value="demo" className="text-xs flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Demo Personas</span>
              </TabsTrigger>
              <TabsTrigger value="login" className="text-xs">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-xs">
                Register
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Instant Quick Demo Switcher */}
            <TabsContent value="demo" className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span> Pick any seeded account
                to experience the Admin or Team Member role workflows immediately.
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {demoUsers.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading demo personas...
                  </div>
                ) : (
                  demoUsers.map((du) => (
                    <button
                      key={du.id}
                      disabled={loading}
                      onClick={() => handleDemoClick(du.id)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-1 ring-border">
                          <AvatarImage src={du.avatarUrl} />
                          <AvatarFallback className="text-xs font-semibold">
                            {du.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                              {du.fullName}
                            </span>
                            <Badge
                              variant={du.role === "ADMIN" ? "default" : "outline"}
                              className={`text-[9px] px-1.5 py-0 h-4 ${
                                du.role === "ADMIN"
                                  ? "bg-indigo-600 text-white"
                                  : "text-emerald-700 bg-emerald-50 border-emerald-300"
                              }`}
                            >
                              {du.role === "ADMIN" ? "👑 Admin" : "👤 Member"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {du.jobTitle || du.email}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Standard Login */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="alex.admin@taskflow.dev"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 text-xs font-semibold mt-2"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            {/* Tab 3: Register New User */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="reg-name" className="text-xs">
                    Full Name
                  </Label>
                  <Input
                    id="reg-name"
                    placeholder="Jane Doe"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-email" className="text-xs">
                    Email Address
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="jane@example.com"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-password" className="text-xs">
                    Password
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Min 6 characters"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs">Role</Label>
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        variant={regRole === "MEMBER" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRegRole("MEMBER")}
                        className="flex-1 h-8 text-[11px]"
                      >
                        <UserIcon className="h-3 w-3 mr-1" />
                        Member
                      </Button>
                      <Button
                        type="button"
                        variant={regRole === "ADMIN" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRegRole("ADMIN")}
                        className="flex-1 h-8 text-[11px]"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-title" className="text-xs">
                      Job Title
                    </Label>
                    <Input
                      id="reg-title"
                      placeholder="e.g. Lead Designer"
                      value={regJobTitle}
                      onChange={(e) => setRegJobTitle(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 text-xs font-semibold mt-3"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
