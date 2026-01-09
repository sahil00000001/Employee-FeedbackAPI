import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, User, Mail, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { loginWithOtp } = useAuth();
  const { toast } = useToast();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await apiRequest("POST", "/api/auth/otp/request", { email });
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your Outlook email for the 6-digit code.",
      });
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send OTP",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick admin/manager/user login with bypass
    if (email === "admin" && otp === "admin") {
      loginWithOtp({ name: "Administrator", role: "admin" }, "admin");
      return;
    }
    if (email === "manager" && otp === "manager") {
      loginWithOtp({ name: "Project Manager", role: "manager", employeeId: "1066" }, "manager");
      return;
    }
    if (email === "user" && otp === "user") {
      loginWithOtp({ name: "Standard User", role: "user", employeeId: "0001" }, "user");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await apiRequest("POST", "/api/auth/otp/verify", { email, otp });
      const data = await res.json();
      
      loginWithOtp(data.user, data.role);
      
      toast({
        title: "Welcome!",
        description: "Login successful.",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Talent360 Login</CardTitle>
          <CardDescription>
            {step === "email" 
              ? "Enter your company email to receive an OTP" 
              : `Enter the code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@podtech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl py-6 font-bold" disabled={isSending}>
                {isSending ? "Sending OTP..." : "Get Access Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="pl-10 text-center tracking-widest text-xl font-bold rounded-xl"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl py-6 font-bold" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button 
                variant="ghost" 
                type="button" 
                className="w-full" 
                onClick={() => setStep("email")}
                disabled={isVerifying}
              >
                Back to Email
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500 mb-4">Secure Login via Outlook SMTP</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="text-center p-3 bg-slate-100 rounded-xl flex items-center justify-center gap-3">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold">OTP expires in 10 minutes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
