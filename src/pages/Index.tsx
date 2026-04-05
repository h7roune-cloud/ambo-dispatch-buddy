import { useState } from "react";
import InterventionForm from "@/components/InterventionForm";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import LoginScreen from "@/components/LoginScreen";
import ConduiteATenir from "@/components/ConduiteATenir";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t, isRtl } = useLanguage();
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem("pc_authenticated") === "true"
  );

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="emergency-header text-primary-foreground py-4 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <img src={logo} alt="Logo Protection Civile" width={48} height={48} className="rounded-lg bg-primary-foreground/20 p-1" />
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">{t("header.title")}</h1>
            <p className="text-xs opacity-80">{t("header.subtitle")}</p>
          </div>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-xl mx-auto px-4 py-5 pb-20">
        <div className="mb-4">
          <ConduiteATenir />
        </div>
        <InterventionForm />
      </main>

      <footer className="text-center text-xs text-muted-foreground py-4 opacity-60">
        {t("footer")}
      </footer>
    </div>
  );
};

export default Index;
