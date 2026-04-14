import { useState } from "react";
import InterventionForm from "@/components/InterventionForm";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import LoginScreen from "@/components/LoginScreen";
import ConduiteATenir from "@/components/ConduiteATenir";
import AboutDialog from "@/components/AboutDialog";
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
    <div className="min-h-[100dvh] bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="emergency-header text-primary-foreground py-3 sm:py-4 px-3 sm:px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex items-center gap-2 sm:gap-3">
          <img src={logo} alt="Logo Protection Civile" width={40} height={40} className="rounded-lg bg-primary-foreground/20 p-1 shrink-0 sm:w-12 sm:h-12" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-lg font-bold leading-tight truncate">{t("header.title")}</h1>
            <p className="text-[10px] sm:text-xs opacity-80 truncate">{t("header.subtitle")}</p>
          </div>
          <AboutDialog />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-5 pb-20">
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
