import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Users, UserCheck, Building2, Shield, Camera, Plus, Trash2, FileText, MessageCircle, Hospital } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { useLanguage, getVictimTypes, getAccidentTypes } from "@/contexts/LanguageContext";

interface Victime {
  id: number;
  nom: string;
  prenom: string;
  age: string;
  etat: string;
  categorie: "victime" | "accident" | "";
  carteIdentite: string | null;
}

interface PhotoIntervention {
  id: number;
  dataUrl: string;
}

type PdfImageFormat = "JPEG" | "PNG" | "WEBP";

const InterventionForm = () => {
  const { t, lang, isRtl } = useLanguage();

  const [heureArrivee, setHeureArrivee] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [dateIntervention, setDateIntervention] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [compteur, setCompteur] = useState("");
  const [lieuAccident, setLieuAccident] = useState("");
  const [typeVictime, setTypeVictime] = useState("");
  const [typeAccident, setTypeAccident] = useState("");
  const [nombreVictimes, setNombreVictimes] = useState("1");
  const [victimes, setVictimes] = useState<Victime[]>([
    { id: 1, nom: "", prenom: "", age: "", etat: "léger", categorie: "", carteIdentite: null },
  ]);
  const [numeroUrgence, setNumeroUrgence] = useState("");
  const [hopital, setHopital] = useState("");
  const [policePresente, setPolicePresente] = useState(false);
  const [gendarmeriePresente, setGendarmeriePresente] = useState(false);
  const [observations, setObservations] = useState("");
  const [photosIntervention, setPhotosIntervention] = useState<PhotoIntervention[]>([]);
  const [heureArriveeHopital, setHeureArriveeHopital] = useState("");
  const [compteurHopital, setCompteurHopital] = useState("");
  const [observationsHopital, setObservationsHopital] = useState("");
  const [activePage, setActivePage] = useState<"page1" | "page2">("page1");

  const photosInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const victimTypes = getVictimTypes(lang);
  const accidentTypes = getAccidentTypes(lang);

  const compressImage = (dataUrl: string, maxSize = 1200, quality = 0.7): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = dataUrl;
    });

  const updateVictime = (id: number, field: keyof Victime, value: string | null) => {
    setVictimes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const addVictime = () => {
    const newId = victimes.length > 0 ? Math.max(...victimes.map((v) => v.id)) + 1 : 1;
    setVictimes((prev) => [
      ...prev,
      { id: newId, nom: "", prenom: "", age: "", etat: "léger", categorie: "", carteIdentite: null },
    ]);
    setNombreVictimes(String(victimes.length + 1));
  };

  const removeVictime = (id: number) => {
    if (victimes.length <= 1) return;
    setVictimes((prev) => prev.filter((v) => v.id !== id));
    setNombreVictimes(String(victimes.length - 1));
  };

  const handleImageUpload = async (victimeId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compressed = await compressImage(reader.result as string);
        updateVictime(victimeId, "carteIdentite", compressed);
      } catch {
        updateVictime(victimeId, "carteIdentite", reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const rawDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    let dataUrl = rawDataUrl;
    try {
      dataUrl = await compressImage(rawDataUrl);
    } catch { /* use raw */ }
    setPhotosIntervention((prev) => [...prev, { id: Date.now(), dataUrl }]);
    e.currentTarget.value = "";
  };

  const removePhoto = (id: number) => {
    setPhotosIntervention((prev) => prev.filter((p) => p.id !== id));
  };

  const buildPageReport = (page: "page1" | "page2") => {
    const isAr = lang === "ar";
    let report = "";

    if (page === "page1") {
      report += `📅 ${t("form.date")}: ${dateIntervention}\n`;
      report += `🕐 ${t("form.time")}: ${heureArrivee}\n`;
      report += `📍 ${t("form.accidentLocation")}: ${lieuAccident}\n\n`;
      if (typeVictime) report += `🚨 *${t("form.victimDanger")}:* ${typeVictime}\n`;
      if (typeAccident) report += `🚗 *${t("form.trafficAccident")}:* ${typeAccident}\n`;
      report += `\n👥 ${t("form.victims")}: ${nombreVictimes}\n\n`;

      victimes.forEach((v, i) => {
        report += `━ *${t("form.victim")} ${i + 1}* ━\n`;
        if (v.categorie === "victime") report += `  📋 ${t("form.victimCategory")}: 🚨 ${t("form.categoryVictime")}${typeVictime ? ` (${typeVictime})` : ""}\n`;
        if (v.categorie === "accident") report += `  📋 ${t("form.victimCategory")}: 🚗 ${t("form.categoryAccident")}${typeAccident ? ` (${typeAccident})` : ""}\n`;
        report += `  ${t("form.lastName")}: ${v.nom} ${v.prenom}\n`;
        report += `  ${t("form.age")}: ${v.age}\n`;
        report += `  ${t("form.state")}: ${v.etat === "grave" ? (isAr ? "🔴 خطير" : "🔴 GRAVE") : (isAr ? "🟢 خفيف" : "🟢 Léger")}\n\n`;
      });

      report += `👮 ${t("form.policePresent")}: ${policePresente ? "✅" : "❌"}\n`;
      report += `🛡️ ${t("form.gendarmeriePresent")}: ${gendarmeriePresente ? "✅" : "❌"}\n`;

      if (observations) {
        report += `\n📝 ${t("form.observations")}:\n${observations}\n`;
      }
    } else {
      report += `🔢 ${t("form.counter")}: ${compteur} km\n`;
      report += `🏥 ${t("form.hospital")}: ${hopital}\n`;
      report += `🔧 ${t("form.suc")}: ${numeroUrgence}\n`;
      if (heureArriveeHopital) report += `🕐 ${t("form.hospitalArrivalTime")}: ${heureArriveeHopital}\n`;
      if (compteurHopital) report += `🔢 ${t("form.hospitalCounter")}: ${compteurHopital} km\n`;
      if (observationsHopital) {
        report += `\n📝 ${t("form.observations")}:\n${observationsHopital}\n`;
      }
    }

    return report;
  };

  const buildReport = (page: "page1" | "page2" = "page1") => {
    let report = `🚑 *${t("header.title")}*\n`;

    if (page === "page2") {
      // Page 2: include both pages
      report += `*${t("report.page1Title")}*\n`;
      report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      report += buildPageReport("page1");
      report += `\n\n*${t("report.page2Title")}*\n`;
      report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      report += buildPageReport("page2");
    } else {
      report += `*${t("report.page1Title")}*\n`;
      report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      report += buildPageReport("page1");
    }

    return report;
  };

  const getPdfImageFormat = (dataUrl: string): PdfImageFormat => {
    const mimeType = dataUrl.match(/^data:image\/(png|jpe?g|webp)/i)?.[1]?.toLowerCase();
    if (mimeType === "png") return "PNG";
    if (mimeType === "webp") return "WEBP";
    return "JPEG";
  };

  const getImageDimensions = (dataUrl: string) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve({
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
        });
      };
      image.onerror = () => reject(new Error("Image load failed"));
      image.src = dataUrl;
    });

  const addWatermark = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      try {
        const logoImg = document.querySelector('header img[alt="Logo Protection Civile"]') as HTMLImageElement;
        if (logoImg) {
          const canvas = document.createElement("canvas");
          canvas.width = logoImg.naturalWidth || 200;
          canvas.height = logoImg.naturalHeight || 200;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.globalAlpha = 0.08;
            ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);
            const watermarkData = canvas.toDataURL("image/png");
            const wmSize = 120;
            doc.addImage(watermarkData, "PNG", (pageWidth - wmSize) / 2, (pageHeight - wmSize) / 2, wmSize, wmSize);
          }
        }
      } catch { /* skip */ }
      doc.setFontSize(50);
      doc.setTextColor(0, 0, 0);
    }
  };

  const dataUrlToFile = (dataUrl: string, filename: string): File | null => {
    try {
      const [header, base64] = dataUrl.split(",");
      const mime = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new File([bytes], filename, { type: mime });
    } catch {
      return null;
    }
  };

  const generatePDF = async (page: "page1" | "page2" = "page1"): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    // Pre-load all image dimensions in parallel
    const victimDims = (page === "page1" || page === "page2")
      ? await Promise.all(victimes.map((v) => (v.carteIdentite ? getImageDimensions(v.carteIdentite).catch(() => null) : Promise.resolve(null))))
      : [];
    const photoDims = (page === "page1" || page === "page2")
      ? await Promise.all(photosIntervention.map((p) => getImageDimensions(p.dataUrl).catch(() => null)))
      : [];

    const addLine = (text: string, size = 10, bold = false) => {
      if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, pageWidth - 30);
      doc.text(lines, 15, y);
      y += lines.length * (size * 0.5) + 2;
    };

    const addPage1Content = () => {
      addLine(`Date: ${dateIntervention}`, 11);
      addLine(`Heure d'arrivee: ${heureArrivee}`, 11);
      addLine(`Lieu: ${lieuAccident}`, 11);
      y += 4;

      if (typeVictime) addLine(`Victime en danger: ${typeVictime}`, 11, true);
      if (typeAccident) addLine(`Accident de circulation: ${typeAccident}`, 11, true);
      y += 4;

      addLine(`Nombre de victimes: ${nombreVictimes}`, 11);
      y += 2;

      for (let i = 0; i < victimes.length; i++) {
        const v = victimes[i];
        if (y > pageHeight - 55) { doc.addPage(); y = 20; }
        addLine(`--- Victime ${i + 1} ---`, 11, true);
        if (v.categorie === "victime") addLine(`  Categorie: Victime en danger`, 10, true);
        if (v.categorie === "accident") addLine(`  Categorie: Accident de circulation`, 10, true);
        addLine(`  Nom: ${v.nom} ${v.prenom}`, 10);
        addLine(`  Age: ${v.age}`, 10);
        addLine(`  Etat: ${v.etat === "grave" ? "GRAVE" : "Leger"}`, 10);

        if (v.carteIdentite) {
          try {
            addLine("  Carte d'identite:", 10, true);
            const dims = victimDims[i];
            if (dims) {
              const { width, height } = dims;
              const maxWidth = pageWidth - 30;
              const maxHeight = 75;
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              const renderWidth = Math.max(40, width * ratio);
              const renderHeight = Math.max(28, height * ratio);
              const imageFormat = getPdfImageFormat(v.carteIdentite);
              if (y + renderHeight > pageHeight - 20) { doc.addPage(); y = 20; }
              doc.addImage(v.carteIdentite, imageFormat, 15, y, renderWidth, renderHeight, undefined, imageFormat === "JPEG" ? "FAST" : undefined);
              y += renderHeight + 4;
            }
          } catch { /* skip */ }
        }
        y += 4;
      }

      addLine(`Police: ${policePresente ? "Presente" : "Absente"}`, 11);
      addLine(`Gendarmerie: ${gendarmeriePresente ? "Presente" : "Absente"}`, 11);

      if (observations) {
        y += 4;
        addLine("Observations:", 11, true);
        addLine(observations, 10);
      }

      if (photosIntervention.length > 0) {
        y += 4;
        addLine("Photos de l'intervention:", 11, true);
        for (let pi = 0; pi < photosIntervention.length; pi++) {
          const photo = photosIntervention[pi];
          try {
            const dims = photoDims[pi];
            if (!dims) continue;
            const { width, height } = dims;
            const maxWidth = pageWidth - 30;
            const maxHeight = 100;
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            const renderWidth = Math.max(40, width * ratio);
            const renderHeight = Math.max(28, height * ratio);
            const imageFormat = getPdfImageFormat(photo.dataUrl);
            if (y + renderHeight > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.addImage(photo.dataUrl, imageFormat, 15, y, renderWidth, renderHeight, undefined, imageFormat === "JPEG" ? "FAST" : undefined);
            y += renderHeight + 4;
          } catch { /* skip */ }
        }
      }
    };

    const addPage2Content = () => {
      addLine(`Date: ${dateIntervention}`, 11);
      addLine(`Compteur depart: ${compteur} km`, 11);
      addLine(`Hopital de destination: ${hopital}`, 11);
      addLine(`N° Urgence (SUC): ${numeroUrgence}`, 11);
      y += 2;
      if (heureArriveeHopital) addLine(`Heure d'arrivee a l'hopital: ${heureArriveeHopital}`, 11, true);
      if (compteurHopital) addLine(`Compteur a l'hopital: ${compteurHopital} km`, 11, true);

      if (observationsHopital) {
        y += 4;
        addLine("Observations:", 11, true);
        addLine(observationsHopital, 10);
      }
    };

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PROTECTION CIVILE NOUACEUR", pageWidth / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(12);

    if (page === "page1") {
      doc.text("Fiche d'Intervention - Sur le lieu", pageWidth / 2, y, { align: "center" });
      y += 4;
      doc.setLineWidth(0.5);
      doc.line(15, y, pageWidth - 15, y);
      y += 8;
      addPage1Content();
    } else {
      // Page 2: include both pages in one PDF
      doc.text("Fiche d'Intervention - Rapport Complet", pageWidth / 2, y, { align: "center" });
      y += 4;
      doc.setLineWidth(0.5);
      doc.line(15, y, pageWidth - 15, y);
      y += 8;

      // Section 1: Sur le lieu
      addLine("=== Sur le lieu ===", 12, true);
      y += 2;
      addPage1Content();

      // Section 2: Transport hopital
      y += 6;
      if (y > pageHeight - 40) { doc.addPage(); y = 20; }
      addLine("=== Transport hopital ===", 12, true);
      y += 2;
      addPage2Content();
    }
      }
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Cree par Ayoub Sadkouni", pageWidth / 2, 285, { align: "center" });
    }

    addWatermark(doc);
    return doc.output("blob");
  };

  const validateRequiredFields = (page: "page1" | "page2"): boolean => {
    const missing: string[] = [];
    if (page === "page1") {
      if (!dateIntervention.trim()) missing.push(t("form.date"));
      if (!heureArrivee.trim()) missing.push(t("form.time"));
    } else {
      if (!compteur.trim()) missing.push(t("form.counter"));
      if (!hopital.trim()) missing.push(t("form.hospital"));
    }
    if (missing.length > 0) {
      toast.error(`${t("toast.missingFields")} : ${missing.join(", ")}`);
      return false;
    }
    return true;
  };

  const shareViaWhatsApp = async (page: "page1" | "page2") => {
    if (!validateRequiredFields(page)) return;
    const loadingId = toast.loading(t("toast.preparing") || "...");
    try {
      const blob = await generatePDF(page);
      const fileName = `intervention_${page}_${dateIntervention}_${heureArrivee.replace(":", "h")}.pdf`;
      const pdfFile = new File([blob], fileName, { type: "application/pdf" });

      const photoFiles: File[] = [];
      if (page === "page1") {
        photosIntervention.forEach((p, i) => {
          const f = dataUrlToFile(p.dataUrl, `intervention-photo-${i + 1}.jpg`);
          if (f) photoFiles.push(f);
        });
        victimes.forEach((v, i) => {
          if (v.carteIdentite) {
            const f = dataUrlToFile(v.carteIdentite, `carte-identite-victime-${i + 1}.jpg`);
            if (f) photoFiles.push(f);
          }
        });
      }

      const allFiles = [pdfFile, ...photoFiles];
      toast.dismiss(loadingId);
      if (navigator.share && navigator.canShare?.({ files: allFiles })) {
        await navigator.share({
          title: t("header.subtitle"),
          text: buildReport(page),
          files: allFiles,
        });
        toast.success(t("toast.shared"));
      } else {
        const encoded = encodeURIComponent(buildReport(page));
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
        toast.success(t("toast.whatsappOpen"));
      }
    } catch (err: any) {
      toast.dismiss(loadingId);
      if (err.name !== "AbortError") {
        const encoded = encodeURIComponent(buildReport(page));
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
        toast.success(t("toast.whatsappOpen"));
      }
    }
  };

  const sharePDF = async (page: "page1" | "page2") => {
    if (!validateRequiredFields(page)) return;
    const loadingId = toast.loading(t("toast.preparing") || "...");
    try {
      const blob = await generatePDF(page);
      const file = new File([blob], `intervention_${page}_${dateIntervention}_${heureArrivee.replace(":", "h")}.pdf`, { type: "application/pdf" });
      toast.dismiss(loadingId);
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: t("header.subtitle"), text: buildReport(page), files: [file] });
        toast.success(t("toast.pdfShared"));
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t("toast.pdfDownloaded"));
      }
    } catch (err: any) {
      toast.dismiss(loadingId);
      if (err.name !== "AbortError") {
        toast.error(t("toast.pdfError"));
      }
    }
  };

  const ActionBar = ({ page }: { page: "page1" | "page2" }) => (
    <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 flex gap-2 sm:gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      <Button onClick={() => shareViaWhatsApp(page)} className="flex-1 gap-1.5 sm:gap-2 bg-[#25D366] hover:bg-[#25D366]/90 active:scale-[0.97] text-white font-semibold text-sm sm:text-base h-12 sm:h-12 rounded-xl transition-transform">
        <MessageCircle className="w-5 h-5 shrink-0" />
        WhatsApp
      </Button>
      <Button onClick={() => sharePDF(page)} className="flex-1 gap-1.5 sm:gap-2 bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground font-semibold text-sm sm:text-base h-12 sm:h-12 rounded-xl transition-transform">
        <FileText className="w-5 h-5 shrink-0" />
        PDF
      </Button>
    </div>
  );

  return (
    <Tabs value={activePage} onValueChange={(v) => setActivePage(v as "page1" | "page2")} className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full sticky top-[60px] sm:top-[72px] z-30 h-12">
        <TabsTrigger value="page1" className="text-xs sm:text-sm gap-1.5">
          <MapPin className="w-4 h-4" /> {t("form.page1")}
        </TabsTrigger>
        <TabsTrigger value="page2" className="text-xs sm:text-sm gap-1.5">
          <Hospital className="w-4 h-4" /> {t("form.page2")}
        </TabsTrigger>
      </TabsList>

      {/* ============ PAGE 1 — Sur le lieu ============ */}
      <TabsContent value="page1" className="space-y-4 mt-0">
        {/* Date & Heure */}
        <div className="field-group space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Clock className="w-4 h-4" />
            {t("form.dateTime")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">{t("form.date")} <span className="text-red-500">*</span></Label>
              <Input type="date" value={dateIntervention} onChange={(e) => setDateIntervention(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("form.time")} <span className="text-red-500">*</span></Label>
              <Input type="time" value={heureArrivee} onChange={(e) => setHeureArrivee(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="field-group space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <MapPin className="w-4 h-4" />
            {t("form.location")}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t("form.accidentLocation")}</Label>
            <Input placeholder={t("form.accidentLocationPlaceholder")} value={lieuAccident} onChange={(e) => setLieuAccident(e.target.value)} />
          </div>
        </div>

        {/* Victime en danger */}
        <div className="field-group space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Shield className="w-4 h-4" />
            {t("form.victimDanger")}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select value={typeVictime} onValueChange={setTypeVictime}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {victimTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {typeVictime && (
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive/80" onClick={() => setTypeVictime("")}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Accident de circulation */}
        <div className="field-group space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Shield className="w-4 h-4" />
            {t("form.trafficAccident")}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select value={typeAccident} onValueChange={setTypeAccident}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {accidentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {typeAccident && (
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive/80" onClick={() => setTypeAccident("")}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Victimes - identité */}
        <div className="field-group space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Users className="w-4 h-4" />
              {t("form.victims")} ({victimes.length})
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addVictime} className="h-10 px-3 text-xs gap-1.5 rounded-lg active:scale-95 transition-transform">
              <Plus className="w-4 h-4" /> {t("form.addVictim")}
            </Button>
          </div>

          {victimes.map((victime, index) => (
            <div key={victime.id} className="bg-muted/50 rounded-lg p-3 space-y-2 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{t("form.victim")} {index + 1}</span>
                  {victime.categorie === "victime" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-400 font-medium">
                      🚨 {t("form.categoryVictime")}
                    </span>
                  )}
                  {victime.categorie === "accident" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 font-medium">
                      🚗 {t("form.categoryAccident")}
                    </span>
                  )}
                </div>
                {victimes.length > 1 && (
                  <button onClick={() => removeVictime(victime.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {typeVictime && typeAccident && (
                <div>
                  <Label className="text-xs text-muted-foreground">{t("form.victimCategory")} <span className="text-red-500">*</span></Label>
                  <Select value={victime.categorie} onValueChange={(val) => updateVictime(victime.id, "categorie", val)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={t("form.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="victime">🚨 {t("form.categoryVictime")}</SelectItem>
                      <SelectItem value="accident">🚗 {t("form.categoryAccident")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">{t("form.lastName")}</Label>
                  <Input placeholder={t("form.lastName")} value={victime.nom} onChange={(e) => updateVictime(victime.id, "nom", e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t("form.firstName")}</Label>
                  <Input placeholder={t("form.firstName")} value={victime.prenom} onChange={(e) => updateVictime(victime.id, "prenom", e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">{t("form.age")}</Label>
                  <Input type="number" placeholder={t("form.age")} value={victime.age} onChange={(e) => updateVictime(victime.id, "age", e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t("form.state")}</Label>
                  <Select value={victime.etat} onValueChange={(val) => updateVictime(victime.id, "etat", val)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="léger">🟢 {t("form.light")}</SelectItem>
                      <SelectItem value="grave">🔴 {t("form.severe")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">{t("form.idCard")}</Label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={(el) => { fileInputRefs.current[victime.id] = el; }}
                  onChange={(e) => handleImageUpload(victime.id, e)}
                />
                {victime.carteIdentite ? (
                  <div className="relative mt-1">
                    <img src={victime.carteIdentite} alt={t("form.idCard")} className="w-full h-32 object-cover rounded-lg border border-border" />
                    <button
                      onClick={() => updateVictime(victime.id, "carteIdentite", null)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 w-full h-10 text-xs gap-1.5 rounded-lg active:scale-95 transition-transform"
                    onClick={() => fileInputRefs.current[victime.id]?.click()}
                  >
                    <Camera className="w-4 h-4" /> {t("form.takePhoto")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Forces de l'ordre */}
        <div className="field-group space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <UserCheck className="w-4 h-4" />
            {t("form.lawEnforcement")}
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={policePresente} onCheckedChange={(c) => setPolicePresente(c === true)} />
              {t("form.policePresent")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={gendarmeriePresente} onCheckedChange={(c) => setGendarmeriePresente(c === true)} />
              {t("form.gendarmeriePresent")}
            </label>
          </div>
        </div>

        {/* Observations */}
        <div className="field-group space-y-3">
          <Label className="text-xs text-muted-foreground">{t("form.observations")}</Label>
          <Textarea placeholder={t("form.observationsPlaceholder")} value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} />
        </div>

        {/* Photos d'intervention */}
        <div className="field-group space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Camera className="w-4 h-4" />
              {t("form.interventionPhotos")}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={photosInputRef}
              onChange={handlePhotosUpload}
            />
            <Button type="button" size="sm" variant="outline" onClick={() => photosInputRef.current?.click()} className="h-10 px-3 text-xs gap-1.5 rounded-lg active:scale-95 transition-transform">
              <Plus className="w-4 h-4" /> {t("form.add")}
            </Button>
          </div>
          {photosIntervention.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photosIntervention.map((photo) => (
                <div key={photo.id} className="relative">
                  <img src={photo.dataUrl} alt="Photo intervention" className="w-full h-20 object-cover rounded-lg border border-border" />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="button" variant="outline" className="w-full h-11" onClick={() => setActivePage("page2")}>
          {t("form.next")} →
        </Button>

        <ActionBar page="page1" />
      </TabsContent>

      {/* ============ PAGE 2 — Transport hôpital ============ */}
      <TabsContent value="page2" className="space-y-4 mt-0">
        {/* Compteur départ */}
        <div className="field-group space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <MapPin className="w-4 h-4" />
            {t("form.counter")} <span className="text-red-500">*</span>
          </div>
          <Input type="number" placeholder={t("form.counterPlaceholder")} value={compteur} onChange={(e) => setCompteur(e.target.value)} />
        </div>

        {/* Hôpital de destination */}
        <div className="field-group space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Building2 className="w-4 h-4" />
            {t("form.hospital")} <span className="text-red-500">*</span>
          </div>
          <Input placeholder={t("form.hospitalPlaceholder")} value={hopital} onChange={(e) => setHopital(e.target.value)} />
        </div>

        {/* N° urgence (SUC) */}
        <div className="field-group space-y-3">
          <div className="text-primary font-semibold text-sm">
            {t("form.suc")}
          </div>
          <Input type="tel" placeholder={t("form.emergencyPlaceholder")} value={numeroUrgence} onChange={(e) => setNumeroUrgence(e.target.value)} />
        </div>

        {/* Arrivée à l'hôpital */}
        <div className="field-group space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Hospital className="w-4 h-4" />
            {t("form.hospitalArrivalTime")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">{t("form.hospitalArrivalTime")}</Label>
              <Input type="time" value={heureArriveeHopital} onChange={(e) => setHeureArriveeHopital(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("form.hospitalCounter")}</Label>
              <Input type="number" placeholder={t("form.counterPlaceholder")} value={compteurHopital} onChange={(e) => setCompteurHopital(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Observations page 2 */}
        <div className="field-group space-y-3">
          <Label className="text-xs text-muted-foreground">{t("form.observations")}</Label>
          <Textarea placeholder={t("form.observationsPlaceholder")} value={observationsHopital} onChange={(e) => setObservationsHopital(e.target.value)} rows={3} />
        </div>

        <Button type="button" variant="outline" className="w-full h-11" onClick={() => setActivePage("page1")}>
          ← {t("form.previous")}
        </Button>

        <ActionBar page="page2" />
      </TabsContent>
    </Tabs>
  );
};

export default InterventionForm;
