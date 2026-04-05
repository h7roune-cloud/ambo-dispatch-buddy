import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const { t, isRtl } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "pc_nouaceur" && password === "pc_nouaceur") {
      localStorage.setItem("pc_authenticated", "true");
      onLogin();
      toast.success(t("login.welcome"));
    } else {
      setError(true);
      toast.error(t("login.errorToast"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { lang, setLang } = useLanguage();
            }}
            className="hidden"
          />
          <LanguageToggle />
        </div>
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Logo Protection Civile" width={80} height={80} className="rounded-xl" />
          <h1 className="text-xl font-bold text-foreground">{t("login.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("login.username")}</Label>
            <div className="relative">
              <User className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false); }}
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300)}
                placeholder={t("login.usernamePlaceholder")}
                className={`${isRtl ? "pr-10" : "pl-10"} text-base ${error ? "border-destructive" : ""}`}
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("login.password")}</Label>
            <div className="relative">
              <Lock className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300)}
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
