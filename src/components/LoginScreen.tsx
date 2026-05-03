import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const { t, isRtl } = useLanguage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "pc_nouaceur") {
      localStorage.setItem("pc_authenticated", "true");
      onLogin();
      toast.success(t("login.welcome"));
    } else {
      setError(true);
      toast.error(t("login.errorToast"));
    }
  };

  return (
    <div className="app-shell bg-background flex flex-col items-center p-4 relative" dir={isRtl ? "rtl" : "ltr"}>
      {/* Watermark logo at the top */}
      <div className="w-full flex justify-center pt-6 mb-4">
        <img src={logo} alt="" width={120} height={120} className="opacity-15 select-none pointer-events-none" />
      </div>

      <div className="w-full max-w-sm space-y-5 mt-2">
        <div className="flex justify-end">
          <LanguageToggle variant="default" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Logo Protection Civile" width={72} height={72} className="rounded-xl" />
          <h1 className="text-xl font-bold text-foreground">{t("login.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("login.password")}</Label>
            <div className="relative">
              <Lock className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder={t("login.passwordPlaceholder")}
                className={`${isRtl ? "pr-10" : "pl-10"} text-base ${error ? "border-destructive" : ""}`}
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{t("login.error")}</p>}
          <Button type="submit" className="w-full font-semibold">{t("login.submit")}</Button>
        </form>

        <p className="text-center text-xs text-muted-foreground opacity-60">{t("login.footer")}</p>
      </div>
    </div>
  );
};

export default LoginScreen;
