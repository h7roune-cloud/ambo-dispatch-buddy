import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MapPin, Users, UserCheck, Building2, Shield, Share2, MessageCircle, Camera, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

const VICTIMES_EN_DANGER = [
  "Crise cardiaque",
  "Crise d'épilepsie",
  "Crise d'asthme",
  "Crise de panique",
  "Crise diabétique",
  "Blessé bagarre",
  "Blessé chute",
  "Malaise",
  "Noyade",
  "Brûlure",
  "Électrocution",
  "Intoxication",
  "Tentative de suicide",
  "Accouchement",
  "Étouffement",
  "Hémorragie",
  "Morsure de serpent / animal",
  "Allergie grave",
  "Autre",
];

const ACCIDENTS_CIRCULATION = [
  "Collision entre deux véhicules",
  "Carambolage",
  "Heurt de piéton",
  "Renversement",
  "Sortie de route",
  "Accident de moto",
  "Accident de vélo",
  "Accident de camion / poids lourd",
  "Accident de bus / transport en commun",
  "Collision frontale",
  "Collision latérale",
  "Tonneau",
  "Autre",
];

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
  const [hopital, setHopital] = useState("");
  const [policePresente, setPolicePresente] = useState(false);
  const [gendarmeriePresente, setGendarmeriePresente] = useState(false);
  const [observations, setObservations] = useState("");
  const [photosIntervention, setPhotosIntervention] = useState<PhotoIntervention[]>([]);

  const photosInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

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

  const handleImageUpload = (victimeId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateVictime(victimeId, "carteIdentite", reader.result as string);
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setPhotosIntervention((prev) => [...prev, { id: Date.now(), dataUrl }]);
    e.currentTarget.value = "";
  };

  const removePhoto = (id: number) => {
    setPhotosIntervention((prev) => prev.filter((p) => p.id !== id));
  };

  const buildReport = () => {
    let report = `🚑 *PROTECTION CIVILE NOUACEUR*\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    report += `📅 Date: ${dateIntervention}\n`;
    report += `🕐 Heure d'arrivée: ${heureArrivee}\n`;
    report += `🔢 Compteur: ${compteur} km\n`;
    report += `📍 Lieu: ${lieuAccident}\n\n`;
    if (typeVictime) report += `🚨 *Victime en danger:* ${typeVictime}\n`;
    if (typeAccident) report += `🚗 *Accident de circulation:* ${typeAccident}\n`;
    report += `\n`;
    report += `👥 Nombre de victimes: ${nombreVictimes}\n\n`;

    victimes.forEach((v, i) => {
      report += `━ *Victime ${i + 1}* ━\n`;
      report += `  Nom: ${v.nom} ${v.prenom}\n`;
      report += `  Âge: ${v.age}\n`;
      report += `  État: ${v.etat === "grave" ? "🔴 GRAVE" : "🟢 Léger"}\n\n`;
    });

    report += `🏥 Hôpital: ${hopital}\n`;
    report += `👮 Police: ${policePresente ? "✅ Présente" : "❌ Absente"}\n`;
    report += `🛡️ Gendarmerie: ${gendarmeriePresente ? "✅ Présente" : "❌ Absente"}\n`;

    if (observations) {
      report += `\n📝 Observations:\n${observations}\n`;
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

          if (y + renderHeight > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }

          doc.addImage(
            v.carteIdentite,
            imageFormat,
            15,
            y,
            renderWidth,
            renderHeight,
            undefined,
            imageFormat === "JPEG" ? "MEDIUM" : undefined
          );
          y += renderHeight + 4;
        } catch { /* skip */ }
      }
      y += 4;
    }

    addLine(`Hopital: ${hopital}`, 11);
    addLine(`Police: ${policePresente ? "Presente" : "Absente"}`, 11);
    addLine(`Gendarmerie: ${gendarmeriePresente ? "Presente" : "Absente"}`, 11);

    if (observations) {
      y += 4;
      addLine("Observations:", 11, true);
      addLine(observations, 10);
    }

    // Photos d'intervention
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

          if (y + renderHeight > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }

          doc.addImage(
            photo.dataUrl,
            imageFormat,
            15,
            y,
            renderWidth,
            renderHeight,
            undefined,
            imageFormat === "JPEG" ? "MEDIUM" : undefined
          );
          y += renderHeight + 4;
        } catch { /* skip */ }
      }
    }

    // Footer
    y += 10;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Cree par Ayoub Sadkouni", pageWidth / 2, 285, { align: "center" });

    return doc.output("blob");
  };

  const validateRequiredFields = (): boolean => {
    const missing: string[] = [];
    if (!compteur.trim()) missing.push("Compteur kilométrique");
    if (!dateIntervention.trim()) missing.push("Date");
    if (!heureArrivee.trim()) missing.push("Heure d'arrivée");
    if (!hopital.trim()) missing.push("Hôpital de destination");
    if (missing.length > 0) {
      toast.error(`Champs obligatoires manquants : ${missing.join(", ")}`);
      return false;
    }
    return true;
  };

  const shareViaWhatsApp = async () => {
    if (!validateRequiredFields()) return;
    try {
      const blob = await generatePDF();
      const fileName = `intervention_${dateIntervention}_${heureArrivee.replace(":", "h")}.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Fiche d'Intervention - Protection Civile Nouaceur",
          text: buildReport(),
          files: [file],
        });
        toast.success("Rapport partagé avec succès");
      } else {
        // Fallback: open WhatsApp with text only
        const encoded = encodeURIComponent(buildReport());
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
        toast.success("Ouverture de WhatsApp...");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        // Fallback to text-only WhatsApp
        const encoded = encodeURIComponent(buildReport());
        window.open(`https://wa.me/?text=${encoded}`, "_blank");
        toast.success("Ouverture de WhatsApp...");
      }
    }
  };

  const sharePDF = async () => {
    if (!validateRequiredFields()) return;
    try {
      const blob = await generatePDF();
      const file = new File([blob], `intervention_${dateIntervention}_${heureArrivee.replace(":", "h")}.pdf`, { type: "application/pdf" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Fiche d'Intervention",
          files: [file],
        });
        toast.success("Rapport PDF partagé avec succès");
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF téléchargé");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Erreur lors de la création du PDF");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Date & Heure */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Clock className="w-4 h-4" />
          Date & Heure d'arrivée
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Date <span className="text-red-500">*</span></Label>
            <Input type="date" value={dateIntervention} onChange={(e) => setDateIntervention(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Heure <span className="text-red-500">*</span></Label>
            <Input type="time" value={heureArrivee} onChange={(e) => setHeureArrivee(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Compteur & Lieu */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <MapPin className="w-4 h-4" />
          Localisation
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Compteur kilométrique <span className="text-red-500">*</span></Label>
          <Input type="number" placeholder="Ex: 45230" value={compteur} onChange={(e) => setCompteur(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Lieu de l'accident</Label>
          <Input placeholder="Adresse ou description du lieu" value={lieuAccident} onChange={(e) => setLieuAccident(e.target.value)} />
        </div>
      </div>

      {/* Victime en danger */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Shield className="w-4 h-4" />
          Victime en danger
        </div>
        <Select value={typeVictime} onValueChange={setTypeVictime}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            {VICTIMES_EN_DANGER.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accident de circulation */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Shield className="w-4 h-4" />
          Accident de circulation
        </div>
        <Select value={typeAccident} onValueChange={setTypeAccident}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            {ACCIDENTS_CIRCULATION.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Victimes */}
      <div className="field-group space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Users className="w-4 h-4" />
            Victimes ({victimes.length})
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addVictime} className="h-8 text-xs gap-1">
            <Plus className="w-3 h-3" /> Ajouter
          </Button>
        </div>

        {victimes.map((victime, index) => (
          <div key={victime.id} className="bg-muted/50 rounded-lg p-3 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Victime {index + 1}</span>
              {victimes.length > 1 && (
                <button onClick={() => removeVictime(victime.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Nom</Label>
                <Input placeholder="Nom" value={victime.nom} onChange={(e) => updateVictime(victime.id, "nom", e.target.value)} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Prénom</Label>
                <Input placeholder="Prénom" value={victime.prenom} onChange={(e) => updateVictime(victime.id, "prenom", e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Âge</Label>
                <Input type="number" placeholder="Âge" value={victime.age} onChange={(e) => updateVictime(victime.id, "age", e.target.value)} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">État</Label>
                <Select value={victime.etat} onValueChange={(val) => updateVictime(victime.id, "etat", val)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="léger">🟢 Léger</SelectItem>
                    <SelectItem value="grave">🔴 Grave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Carte d'identité */}
            <div>
              <Label className="text-xs text-muted-foreground">Carte d'identité (photo)</Label>
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
                  <img src={victime.carteIdentite} alt="Carte d'identité" className="w-full h-32 object-cover rounded-lg border border-border" />
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
                  <Camera className="w-3 h-3" /> Prendre / Choisir photo
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hôpital */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Building2 className="w-4 h-4" />
          Hôpital de destination <span className="text-red-500">*</span>
        </div>
        <Input placeholder="Nom de l'hôpital" value={hopital} onChange={(e) => setHopital(e.target.value)} />
      </div>

      {/* Forces de l'ordre */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <UserCheck className="w-4 h-4" />
          Forces de l'ordre sur le lieu
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={policePresente} onCheckedChange={(c) => setPolicePresente(c === true)} />
            Police présente
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={gendarmeriePresente} onCheckedChange={(c) => setGendarmeriePresente(c === true)} />
            Gendarmerie présente
          </label>
        </div>
      </div>

      {/* Observations */}
      <div className="field-group space-y-3">
        <Label className="text-xs text-muted-foreground">Observations complémentaires</Label>
        <Textarea placeholder="Notes, détails supplémentaires..." value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} />
      </div>

      {/* Photos d'intervention */}
      <div className="field-group space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Camera className="w-4 h-4" />
            Photos de l'intervention
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
            <Plus className="w-3 h-3" /> Ajouter
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
      <div className="flex gap-3 pt-2">
        <Button onClick={shareViaWhatsApp} className="flex-1 gap-2 bg-success hover:bg-success/90 text-success-foreground font-semibold">
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
        <Button onClick={sharePDF} variant="outline" className="flex-1 gap-2 font-semibold border-primary text-primary hover:bg-accent">
          <FileText className="w-4 h-4" />
          PDF
        </Button>
      </div>
    </div>
  );
};

export default InterventionForm;
