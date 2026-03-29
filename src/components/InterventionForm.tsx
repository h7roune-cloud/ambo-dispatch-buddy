import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MapPin, Users, UserCheck, Building2, Shield, Share2, MessageCircle, Camera, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  };

  const buildReport = () => {
    let report = `🚑 *FICHE D'INTERVENTION AMBULANCE*\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    report += `📅 Date: ${dateIntervention}\n`;
    report += `🕐 Heure d'arrivée: ${heureArrivee}\n`;
    report += `🔢 Compteur: ${compteur} km\n`;
    report += `📍 Lieu: ${lieuAccident}\n\n`;
    report += `⚠️ *Nature de l'accident:*\n${natureAccident}\n\n`;
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

  const shareViaWhatsApp = () => {
    const report = buildReport();
    const encoded = encodeURIComponent(report);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    toast.success("Ouverture de WhatsApp...");
  };

  const shareNative = async () => {
    const report = buildReport();

    // Collect images to share
    const files: File[] = [];
    for (const v of victimes) {
      if (v.carteIdentite) {
        try {
          const res = await fetch(v.carteIdentite);
          const blob = await res.blob();
          files.push(new File([blob], `carte_identite_${v.nom || v.id}.jpg`, { type: blob.type }));
        } catch {
          // skip
        }
      }
    }

    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: "Fiche d'Intervention Ambulance",
          text: report,
        };
        if (files.length > 0 && navigator.canShare?.({ files })) {
          shareData.files = files;
        }
        await navigator.share(shareData);
        toast.success("Rapport partagé avec succès");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Erreur lors du partage");
        }
      }
    } else {
      await navigator.clipboard.writeText(report);
      toast.success("Rapport copié dans le presse-papier");
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
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input type="date" value={dateIntervention} onChange={(e) => setDateIntervention(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Heure</Label>
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
          <Label className="text-xs text-muted-foreground">Compteur kilométrique</Label>
          <Input type="number" placeholder="Ex: 45230" value={compteur} onChange={(e) => setCompteur(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Lieu de l'accident</Label>
          <Input placeholder="Adresse ou description du lieu" value={lieuAccident} onChange={(e) => setLieuAccident(e.target.value)} />
        </div>
      </div>

      {/* Nature de l'accident */}
      <div className="field-group space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Shield className="w-4 h-4" />
          Nature de l'intervention
        </div>
        <Select value={natureAccident} onValueChange={setNatureAccident}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            {ACCIDENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
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
          Hôpital de destination
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

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={shareViaWhatsApp} className="flex-1 gap-2 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-primary-foreground font-semibold">
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
        <Button onClick={shareNative} variant="outline" className="flex-1 gap-2 font-semibold border-primary text-primary hover:bg-accent">
          <Share2 className="w-4 h-4" />
          Partager
        </Button>
      </div>
    </div>
  );
};

export default InterventionForm;
