import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Phone, KeyRound, ArrowRight } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("يرجى إدخال رقم الهاتف");
      return;
    }

    setLoading(true);
    const errorMsg = await sendOtp(phone);
    setLoading(false);

    if (errorMsg) {
      setError(errorMsg);
    } else {
      setStep("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("يرجى إدخال رمز التحقق");
      return;
    }

    setLoading(true);
    const errorMsg = await verifyOtp(phone, otp);
    setLoading(false);

    if (errorMsg) {
      setError(errorMsg);
    } else {
      navigate("/today");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">مدرسة موال</h1>
          <p className="text-muted-foreground mt-1">منصة الحضور والغياب</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl border shadow-sm p-8">
          <h2 className="text-lg font-semibold mb-6">
            {step === "phone" ? "تسجيل الدخول" : "تأكيد رقم الهاتف"}
          </h2>

          <form onSubmit={step === "phone" ? handleSendOtp : handleVerifyOtp} className="space-y-5">

            {step === "phone" && (
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="h-11 text-right pe-10"
                    autoFocus
                    disabled={loading}
                    dir="ltr"
                  />
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-2 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="otp">رمز التحقق</Label>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" />
                    تغيير الرقم
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter code"
                    className="h-11 text-center tracking-widest text-lg"
                    autoFocus
                    disabled={loading}
                    maxLength={4}
                  />
                  <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  تم إرسال رمز التحقق إلى الرقم {phone}
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step === "phone" ? (
                "إرسال رمز التحقق"
              ) : (
                "التحقق والدخول"
              )}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
