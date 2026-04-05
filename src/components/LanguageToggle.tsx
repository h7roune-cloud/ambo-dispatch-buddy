import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
      className="text-primary-foreground hover:bg-primary-foreground/20 h-9 w-9"
      title={lang === "fr" ? "العربية" : "Français"}
    >
      <span className="text-xs font-bold">{lang === "fr" ? "ع" : "FR"}</span>
    </Button>
  );
};

export default LanguageToggle;
