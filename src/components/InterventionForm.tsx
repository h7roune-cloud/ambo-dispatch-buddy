import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MapPin, Users, UserCheck, Building2, Shield, Camera, Plus, Trash2, FileText, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { useLanguage, getVictimTypes, getAccidentTypes } from "@/contexts/LanguageContext";

interface Victime {
  id: number;
  nom: string;
  prenom: string;
  age: string;
  etat: string;
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
    { id: 1, nom: "", prenom: "", age: "", etat: "léger", carteIdentite: null },
  ]);
  const [numeroUrgence, setNumeroUrgence] = useState("");
  const [hopital, setHopital] = useState("");
  const [policePresente, setPolicePresente] = useState(false);
  const [gendarmeriePresente, setGendarmeriePresente] = useState(false);
  const [observations, setObservations] = useState("");
  const [photosIntervention, setPhotosIntervention] = useState<PhotoIntervention[]>([]);

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
      { id: newId, nom: "", prenom: "", age: "", etat: "léger", carteIdentite: null },
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

  const buildReport = () => {
    const isAr = lang === "ar";
    let report = `🚑 *${t("header.title")}*\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    report += `📅 ${t("form.date")}: ${dateIntervention}\n`;
    report += `🕐 ${t("form.time")}: ${heureArrivee}\n`;
    report += `🔢 ${t("form.counter")}: ${compteur} km\n`;
    report += `📍 ${t("form.accidentLocation")}: ${lieuAccident}\n\n`;
    if (typeVictime) report += `🚨 *${t("form.victimDanger")}:* ${typeVictime}\n`;
    if (typeAccident) report += `🚗 *${t("form.trafficAccident")}:* ${typeAccident}\n`;
    report += `\n`;
    report += `👥 ${t("form.victims")}: ${nombreVictimes}\n\n`;

    victimes.forEach((v, i) => {
      report += `━ *${t("form.victim")} ${i + 1}* ━\n`;
      report += `  ${t("form.lastName")}: ${v.nom} ${v.prenom}\n`;
      report += `  ${t("form.age")}: ${v.age}\n`;
      report += `  ${t("form.state")}: ${v.etat === "grave" ? (isAr ? "🔴 خطير" : "🔴 GRAVE") : (isAr ? "🟢 خفيف" : "🟢 Léger")}\n\n`;
    });

    report += `📞 ${t("form.emergencyNumber")}: ${numeroUrgence}\n`;
    report += `🏥 ${t("form.hospital")}: ${hopital}\n`;
    report += `👮 ${t("form.policePresent")}: ${policePresente ? "✅" : "❌"}\n`;
    report += `🛡️ ${t("form.gendarmeriePresent")}: ${gendarmeriePresente ? "✅" : "❌"}\n`;

    if (observations) {
      report += `\n📝 ${t("form.observations")}:\n${observations}\n`;
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
      doc.setTextColor(200, 200, 200);
      doc.setFont("helvetica", "bold");
      doc.text("PROTECTION CIVILE", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });
      doc.setTextColor(0, 0, 0);
    }
  };

  const generatePDF = async (): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    const addLine = (text: string, size = 10, bold = false) => {
      if (y > pageHeight - 20) { doc.addPage(); y = 20; }
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, pageWidth - 30);
      doc.text(lines, 15, y);
      y += lines.length * (size * 0.5) + 2;
    };

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PROTECTION CIVILE NOUACEUR", pageWidth / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(12);
    doc.text("Fiche d'Intervention", pageWidth / 2, y, { align: "center" });
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;

    addLine(`Date: ${dateIntervention}`, 11);
    addLine(`Heure d'arrivee: ${heureArrivee}`, 11);
    addLine(`Compteur: ${compteur} km`, 11);
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
      addLine(`  Nom: ${v.nom} ${v.prenom}`, 10);
      addLine(`  Age: ${v.age}`, 10);
      addLine(`  Etat: ${v.etat === "grave" ? "GRAVE" : "Leger"}`, 10);

      if (v.carteIdentite) {
        try {
          addLine("  Carte d'identite:", 10, true);
          const { width, height } = await getImageDimensions(v.carteIdentite);
          const maxWidth = pageWidth - 30;
          const maxHeight = 75;
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          const renderWidth = Math.max(40, width * ratio);
          const renderHeight = Math.max(28, height * ratio);
          const imageFormat = getPdfImageFormat(v.carteIdentite);
          if (y + renderHeight > pageHeight - 20) { doc.addPage(); y = 20; }
          doc.addImage(v.carteIdentite, imageFormat, 15, y, renderWidth, renderHeight, undefined, imageFormat === "JPEG" ? "MEDIUM" : undefined);
          y += renderHeight + 4;
        } catch { /* skip */ }
      }
      y += 4;
    }

    addLine(`N° Urgence: ${numeroUrgence}`, 11);
    addLine(`Hopital: ${hopital}`, 11);
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
      for (const photo of photosIntervention) {
        try {
          const { width, height } = await getImageDimensions(photo.dataUrl);
          const maxWidth = pageWidth - 30;
          const maxHeight = 100;
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          const renderWidth = Math.max(40, width * ratio);
          const renderHeight = Math.max(28, height * ratio);
          const imageFormat = getPdfImageFormat(photo.dataUrl);
          if (y + renderHeight > pageHeight - 20) { doc.addPage(); y = 20; }
          doc.addImage(photo.dataUrl, imageFormat, 15, y, renderWidth, renderHeight, undefined, imageFormat === "JPEG" ? "MEDIUM" : undefined);
          y += renderHeight + 4;
        } catch { /* skip */ }
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

  const validateRequiredFields = (): boolean => {
    const missing: string[] = [];
    if (!compteur.trim()) missing.push(t("form.counter"));
    if (!dateIntervention.trim()) missing.push(t("form.date"));
    if (!heureArrivee.trim()) missing.push(t("form.time"));
    if (!hopital.trim()) missing.push(t("form.hospital"));
    if (missing.length > 0) {
      toast.error(`${t("toast.missingFields")} : ${missing.join(", ")}`);
      return false;
    }
    return true;
  };

  const shareViaWhatsApp = async () => {
    if (!validateRequiredFields()) return;
    try {
      const blob = await generatePDF();
      const fileName = `intervention_${dateIntervention}_${heureArrivee.replace(":", "h")}.pdf`;
      const pdfFile = new File([blob], fileName, { type: "application/pdf" });

      const photoFiles: File[] = [];
      for (let i = 0; i < photosIntervention.length; i++) {
        try {
          const res = await fetch(photosIntervention[i].dataUrl);
          const photoBlob = await res.blob();
          photoFiles.push(new File([photoBlob], `intervention-photo-${i + 1}.jpg`, { type: "image/jpeg" }));
        } catch { /* skip */ }
      }
      for (let i = 0; i < victimes.length; i++) {
        if (victimes[i].carteIdentite) {
          try {
            const res = await fetch(victimes[i].carteIdentite!);
            const photoBlob = await res.blob();
            photoFiles.push(new File([photoBlob], `carte-identite-victime-${i + 1}.jpg`, { type: "image/jpeg" }));
          } catch { /* skip */ }
        }
      }

      const allFiles = [pdfFile, ...photoFiles];
      if (navigator.share && navigator.canShare?.({ files: allFiles })) {
        await navigator.share({
          title: t("header.subtitle"),
          text: buildReport(),
          files: allFiles,
        });
        toast.success(t("toast.shared"));
      } else {
        const encoded = encodeURIComponent(buildReport());
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
        toast.success(t("toast.whatsappOpen"));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        const encoded = encodeURIComponent(buildReport());
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
        toast.success(t("toast.whatsappOpen"));
      }
    }
  };

  const sharePDF = async () => {
    if (!validateRequiredFields()) return;
    try {
      const blob = await generatePDF();
      const file = new File([blob], `intervention_${dateIntervention}_${heureArrivee.replace(":", "h")}.pdf`, { type: "application/pdf" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: t("header.subtitle"), files: [file] });
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
      if (err.name !== "AbortError") {
        toast.error(t("toast.pdfError"));
      }
    }
  };

  return (
    <div className="space-y-4">
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

      {/* Compteur & Lieu */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <MapPin className="w-4 h-4" />
          {t("form.location")}
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t("form.counter")} <span className="text-red-500">*</span></Label>
          <Input type="number" placeholder={t("form.counterPlaceholder")} value={compteur} onChange={(e) => setCompteur(e.target.value)} />
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

      {/* Victimes */}
      <div className="field-group space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Users className="w-4 h-4" />
            {t("form.victims")} ({victimes.length})
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addVictime} className="h-8 text-xs gap-1">
            <Plus className="w-3 h-3" /> {t("form.addVictim")}
          </Button>
        </div>

        {victimes.map((victime, index) => (
          <div key={victime.id} className="bg-muted/50 rounded-lg p-3 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{t("form.victim")} {index + 1}</span>
              {victimes.length > 1 && (
                <button onClick={() => removeVictime(victime.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
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

            {/* Carte d'identité */}
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
                  className="mt-1 w-full h-9 text-xs gap-1"
                  onClick={() => fileInputRefs.current[victime.id]?.click()}
                >
                  <Camera className="w-3 h-3" /> {t("form.takePhoto")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Numéro d'urgence */}
      <div className="field-group space-y-3">
        <div className="text-primary font-semibold text-sm">
          {t("form.emergencyNumber")}
        </div>
        <Input type="tel" placeholder={t("form.emergencyPlaceholder")} value={numeroUrgence} onChange={(e) => setNumeroUrgence(e.target.value)} />
      </div>

      {/* Hôpital */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Building2 className="w-4 h-4" />
          {t("form.hospital")} <span className="text-red-500">*</span>
        </div>
        <Input placeholder={t("form.hospitalPlaceholder")} value={hopital} onChange={(e) => setHopital(e.target.value)} />
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
          <Button type="button" size="sm" variant="outline" onClick={() => photosInputRef.current?.click()} className="h-8 text-xs gap-1">
            <Plus className="w-3 h-3" /> {t("form.add")}
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

      {/* Actions */}
      <div className="flex gap-2 sm:gap-3 pt-2">
        <Button onClick={shareViaWhatsApp} className="flex-1 gap-1 sm:gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-semibold text-xs sm:text-sm h-10 sm:h-11">
          <MessageCircle className="w-4 h-4 shrink-0" />
          WhatsApp
        </Button>
        <Button onClick={sharePDF} className="flex-1 gap-1 sm:gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm h-10 sm:h-11">
          <FileText className="w-4 h-4 shrink-0" />
          PDF
        </Button>
      </div>
    </div>
  );
};

export default InterventionForm;
