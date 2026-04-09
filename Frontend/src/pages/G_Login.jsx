import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md shadow-card border border-border/60 backdrop-blur-sm">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">
              EF
            </div>

            <h1 className="text-3xl font-heading font-bold text-foreground">
              Welcome Back
            </h1>

            <p className="text-sm text-muted-foreground">
              Sign in to EventFlow and continue managing your events smoothly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm font-semibold">
              Login
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No account?{" "}
              <Link to="/register" className="text-primary font-medium underline">
                Register
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}