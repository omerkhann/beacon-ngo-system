import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Users, Heart, Check, X } from "lucide-react";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { apiCall } from "@/lib/api";

type UserRole = "DONOR" | "VOLUNTEER";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password validation state
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
  });

  const updatePasswordChecks = (password: string) => {
    setPasswordChecks({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    });
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("form");
    setError("");
  };

  const handleBackToRole = () => {
    setStep("role");
    setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      return;
    }
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!isPasswordValid) {
      setError("Password must be at least 6 characters, contain an uppercase letter, and a number");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await apiCall("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Signup failed");
      }

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Update password checks when password changes
    if (name === "password") {
      updatePasswordChecks(value);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <PublicHeader />
      
      <div className="flex-1 relative" style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}>
        {/* Dark overlay - behind content */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        
        <main className="flex items-center justify-center py-12 px-4 relative z-10 min-h-full">
          <div className="w-full max-w-md space-y-6">

        {/* Step 1: Role Selection */}
        {step === "role" && (
          <div className="space-y-4">
            <Card className="border-2 bg-white dark:bg-slate-950">
              <CardHeader>
                <CardTitle>Join as a Volunteer or Donor</CardTitle>
                <CardDescription>
                  Choose your role to get started with Beacon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Select the role that best describes you:
                </p>

                {/* Volunteer Card */}
                <button
                  onClick={() => handleRoleSelect("VOLUNTEER")}
                  className="w-full p-4 border-2 border-primary/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Volunteer</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Apply to campaigns, log service hours, and make an impact
                      </p>
                    </div>
                  </div>
                </button>

                {/* Donor Card */}
                <button
                  onClick={() => handleRoleSelect("DONOR")}
                  className="w-full p-4 border-2 border-primary/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Donor</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Support campaigns, track donations, and view impact reports
                      </p>
                    </div>
                  </div>
                </button>

                {/* Back to Login */}
                <p className="text-center text-sm text-muted-foreground pt-4">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/login")}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors underline"
                  >
                    Sign in here
                  </button>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Signup Form */}
        {step === "form" && (
          <Card className="border-2 bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle>
                Create {selectedRole === "VOLUNTEER" ? "Volunteer" : "Donor"} Account
              </CardTitle>
              <CardDescription>
                Fill in your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-200">
                    Account created successfully! Redirecting to login...
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="border-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    At least 3 characters, letters and numbers only
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`border-primary/20 ${
                      formData.password
                        ? isPasswordValid
                          ? "border-green-500 focus:border-green-500"
                          : "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {/* Password requirements checklist */}
                  {formData.password && (
                    <div className="mt-3 space-y-1.5 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {passwordChecks.length ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={passwordChecks.length ? "text-green-700 dark:text-green-300 font-medium" : "text-gray-600 dark:text-gray-400"}>
                          At least 6 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.uppercase ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={passwordChecks.uppercase ? "text-green-700 dark:text-green-300 font-medium" : "text-gray-600 dark:text-gray-400"}>
                          At least one uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.number ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={passwordChecks.number ? "text-green-700 dark:text-green-300 font-medium" : "text-gray-600 dark:text-gray-400"}>
                          At least one number (0-9)
                        </span>
                      </div>
                    </div>
                  )}
                  {!formData.password && (
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters with uppercase letter and number
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="border-primary/20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={loading || success}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <Button
                type="button"
                onClick={handleBackToRole}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                Back to Role Selection
              </Button>
            </CardContent>
          </Card>
        )}
          </div>
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}
