import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import API from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(""); // username
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return toast({
        title: "Missing fields",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
    }

    try {
      setIsLoading(true);

      const res = await API.post("/auth/login", {
        username: email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });

      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* BACKGROUND BLUR */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[400px] animate-fade-in">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <span className="text-xl font-bold text-primary-foreground">A</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your admin account
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* USERNAME */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              className="h-11 w-full text-sm font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
