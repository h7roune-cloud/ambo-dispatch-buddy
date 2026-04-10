import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

const AboutDialog = () => {
  const { t, isRtl } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-primary-foreground hover:bg-primary-foreground/20">
          <Info className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader className="items-center">
          <img src={logo} alt="Logo" className="w-16 h-16 rounded-xl mb-2" />
          <DialogTitle className="text-center text-lg">{t("about.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>{t("about.desc1")}</p>
          <p>{t("about.desc2")}</p>
        </div>
        <div className="pt-3 border-t text-center">
          <p className="text-xs text-muted-foreground">{t("about.createdBy")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
