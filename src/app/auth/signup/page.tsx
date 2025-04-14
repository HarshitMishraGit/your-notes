"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      }

      router.push("/auth/signin");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-neutral-950 -z-1"></div>
      <Card className="w-full max-w-md mx-4 bg-black/60 border-neutral-800 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Create your account
          </CardTitle>
          <CardDescription className="text-center text-neutral-400">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-200">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                className="bg-neutral-950/50 border-neutral-800 text-neutral-200 placeholder:text-neutral-500"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-200">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="bg-neutral-950/50 border-neutral-800 text-neutral-200 placeholder:text-neutral-500"
                placeholder="m@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-200">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-neutral-950/50 border-neutral-800 text-neutral-200"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              Sign up
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
