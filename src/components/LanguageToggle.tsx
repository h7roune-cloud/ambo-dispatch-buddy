import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  variant?: "header" | "default";
}

const LanguageToggle = ({ variant = "header" }: LanguageToggleProps) => {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
      className={variant === "header"
        ? "text-primary-foreground hover:bg-primary-foreground/20 h-9 w-9"
        : "text-foreground hover:bg-muted h-9 w-9 border border-border"
      }
      title={lang === "fr" ? "العربية" : "Français"}
    >
      <span className="text-xs font-bold">{lang === "fr" ? "ع" : "FR"}</span>
    </Button>
  );
};

export default LanguageToggle;
