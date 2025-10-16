import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/services/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";

// ✅ Validation schema
const authSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;

        // Pequeña pausa para que la sesión se guarde antes de navegar
        await new Promise((r) => setTimeout(r, 400));
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        alert("✅ Account created! Check your email to confirm your account.");
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      form.setError("password", {
        message:
          err?.message ||
          (mode === "login"
            ? "Invalid credentials"
            : "Could not create account"),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            {mode === "login" ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "login"
              ? "Log in to manage your plants "
              : "Join our plant swap community "}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Loading..."
                  : mode === "login"
                  ? "Sign In"
                  : "Sign Up"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <a href="/signup" className="text-primary underline">
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a href="/login" className="text-primary underline">
                  Log in
                </a>
              </>
            )}
          </p>
        </CardContent>

        {/* 🌐 OAuth Providers */}
        <div className="flex flex-col gap-2 mt-2 px-6 pb-4">
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.94 0 6.63 1.69 8.15 3.1l6-6C34.5 2.8 29.7 0 24 0 14.6 0 6.6 5.8 3.1 14.1l7 5.4C11.4 12.4 17 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.5 24.5c0-1.63-.13-3.18-.38-4.68H24v9.3h12.8c-.56 2.9-2.24 5.36-4.74 7.02l7.3 5.7c4.27-3.93 6.14-9.72 6.14-17.34z"
              />
              <path
                fill="#4A90E2"
                d="M24 48c6.48 0 11.9-2.13 15.87-5.77l-7.3-5.7C30.52 38.8 27.55 39.9 24 39.9c-6.82 0-12.6-4.6-14.67-10.92l-7.03 5.4C5.64 41.3 14 48 24 48z"
              />
              <path
                fill="#FBBC05"
                d="M9.33 28.98C8.83 27.48 8.56 25.8 8.56 24s.27-3.48.77-4.98l-7-5.4C.86 17.2 0 20.5 0 24c0 3.5.86 6.8 2.33 9.78l7-5.4z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "github" })
            }
            className="flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 0a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.61-4.04-1.61a3.18 3.18 0 0 0-1.34-1.76c-1.1-.76.09-.75.09-.75a2.52 2.52 0 0 1 1.83 1.23 2.56 2.56 0 0 0 3.51 1 2.56 2.56 0 0 1 .76-1.6c-2.66-.3-5.46-1.33-5.46-5.9a4.63 4.63 0 0 1 1.23-3.21 4.3 4.3 0 0 1 .12-3.17s1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0C16.9 4.5 17.9 4.82 17.9 4.82a4.3 4.3 0 0 1 .12 3.17 4.63 4.63 0 0 1 1.23 3.21c0 4.58-2.8 5.59-5.47 5.89a2.9 2.9 0 0 1 .83 2.24v3.32c0 .32.21.7.83.58A12 12 0 0 0 12 0z" />
            </svg>
            <span>Continue with GitHub</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
