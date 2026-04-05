import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen } from "lucide-react";
import { useLanguage, stepsTranslations } from "@/contexts/LanguageContext";

interface Protocole {
  titre: string;
  titreKey: string;
  emoji: string;
  stepsKey: string;
  etapes: string[];
}

interface Categorie {
  nom: string;
  nomKey: string;
  emoji: string;
  protocoles: Protocole[];
}

const CATEGORIES: Categorie[] = [
  {
    nom: "Plaies & Hémorragies", nomKey: "cat.plaies", emoji: "🩸",
    protocoles: [
      { titre: "Plaie simple", titreKey: "proto.plaieSimple", emoji: "🩹", stepsKey: "plaieSimple", etapes: ["Mettre des gants","Nettoyer la plaie à l'eau ou sérum physiologique","Désinfecter du centre vers l'extérieur","Appliquer un pansement stérile","Vérifier la vaccination antitétanique"] },
      { titre: "Plaie grave / profonde", titreKey: "proto.plaieGrave", emoji: "🔴", stepsKey: "plaieGrave", etapes: ["Ne pas retirer un corps étranger","Allonger la victime","Couvrir la plaie avec un pansement stérile","Ne rien donner à boire ni à manger","Surveiller les signes de choc","Évacuer rapidement vers l'hôpital"] },
      { titre: "Hémorragie externe", titreKey: "proto.hemorragie", emoji: "💉", stepsKey: "hemorragie", etapes: ["Compression directe avec un tissu propre","Allonger la victime","Surélever le membre si possible","Garrot uniquement en dernier recours (noter l'heure)","Surveiller l'état de conscience","Évacuer d'urgence"] },
    ],
  },
  {
    nom: "Fractures & Traumatismes", nomKey: "cat.fractures", emoji: "🦴",
    protocoles: [
      { titre: "Fracture de membre", titreKey: "proto.fractureMembre", emoji: "🦵", stepsKey: "fractureMembre", etapes: ["Immobiliser le membre dans la position trouvée","Ne pas tenter de réaligner","Utiliser une attelle ou écharpe","Appliquer de la glace (protégée) si possible","Surveiller la circulation en aval (pouls, couleur, sensibilité)","Évacuer vers l'hôpital"] },
      { titre: "Suspicion trauma crânien", titreKey: "proto.traumaCranien", emoji: "🧠", stepsKey: "traumaCranien", etapes: ["Ne pas bouger la victime","Maintenir l'axe tête-cou-tronc","Surveiller la conscience (score de Glasgow)","Mettre en PLS si inconsciente mais respire","Noter l'heure et l'évolution","Évacuation médicalisée urgente"] },
      { titre: "Suspicion trauma du rachis", titreKey: "proto.traumaRachis", emoji: "🔒", stepsKey: "traumaRachis", etapes: ["Ne jamais mobiliser la victime","Maintenir la tête en position neutre","Poser un collier cervical si disponible","Attendre les renforts médicalisés","Surveiller respiration et conscience"] },
    ],
  },
  {
    nom: "Brûlures", nomKey: "cat.brulures", emoji: "🔥",
    protocoles: [
      { titre: "Brûlure thermique", titreKey: "proto.brulureThermique", emoji: "♨️", stepsKey: "brulureThermique", etapes: ["Refroidir sous l'eau tiède (15-20°C) pendant 10-15 min","Retirer vêtements non collés","Ne pas percer les cloques","Couvrir avec un pansement stérile humide","Évaluer la surface et la profondeur","Évacuer si brûlure grave (>10%, visage, mains, articulations)"] },
      { titre: "Brûlure chimique", titreKey: "proto.brulureChimique", emoji: "⚗️", stepsKey: "brulureChimique", etapes: ["Rincer abondamment à l'eau pendant 20 min minimum","Retirer les vêtements contaminés","Ne pas utiliser de neutralisant","Protéger les yeux si atteints","Évacuer d'urgence"] },
      { titre: "Électrocution", titreKey: "proto.electrocution", emoji: "⚡", stepsKey: "electrocution", etapes: ["Couper la source électrique AVANT tout contact","Vérifier la conscience et la respiration","Rechercher les points d'entrée et de sortie","Surveiller le rythme cardiaque","Commencer la RCP si nécessaire","Évacuation médicalisée obligatoire"] },
    ],
  },
  {
    nom: "Détresse respiratoire", nomKey: "cat.respiratoire", emoji: "🫁",
    protocoles: [
      { titre: "Étouffement (obstruction)", titreKey: "proto.etouffement", emoji: "😰", stepsKey: "etouffement", etapes: ["Si la victime tousse : encourager à tousser","Si inefficace : 5 claques dans le dos","Si échec : 5 compressions abdominales (Heimlich)","Alterner claques/compressions","Si inconscience : commencer la RCP"] },
      { titre: "Crise d'asthme", titreKey: "proto.asthme", emoji: "💨", stepsKey: "asthme", etapes: ["Mettre la victime en position assise","Aider à prendre son traitement (bronchodilatateur)","Rassurer et calmer","Aérer la pièce","Si pas d'amélioration en 5 min : évacuer"] },
      { titre: "Noyade", titreKey: "proto.noyade", emoji: "🌊", stepsKey: "noyade", etapes: ["Sortir la victime de l'eau en sécurité","Allonger sur le dos, dégager les voies aériennes","Commencer la RCP si arrêt respiratoire (5 insufflations d'abord)","Mettre en PLS si respire mais inconsciente","Réchauffer la victime","Évacuation médicalisée"] },
    ],
  },
  {
    nom: "Urgences médicales", nomKey: "cat.urgences", emoji: "🏥",
    protocoles: [
      { titre: "Arrêt cardiaque", titreKey: "proto.arretCardiaque", emoji: "❤️", stepsKey: "arretCardiaque", etapes: ["Vérifier la conscience et la respiration","Appeler les secours immédiatement","Commencer le massage cardiaque (100-120/min)","Utiliser un DAE si disponible","Alterner 30 compressions / 2 insufflations","Ne pas s'arrêter jusqu'à l'arrivée des secours"] },
      { titre: "Crise d'épilepsie", titreKey: "proto.epilepsie", emoji: "⚡", stepsKey: "epilepsie", etapes: ["Ne pas maintenir la victime","Écarter les objets dangereux","Protéger la tête (coussin, vêtement)","Ne rien mettre dans la bouche","Après la crise : PLS et surveiller","Évacuer si crise > 5 min ou si première crise"] },
      { titre: "Malaise / perte de connaissance", titreKey: "proto.malaise", emoji: "😵", stepsKey: "malaise", etapes: ["Allonger la victime, surélever les jambes","Desserrer les vêtements","Aérer et protéger du froid/chaleur","Si inconsciente et respire : PLS","Surveiller en continu","Interroger sur les antécédents si consciente"] },
      { titre: "Crise diabétique (hypoglycémie)", titreKey: "proto.diabetique", emoji: "🍬", stepsKey: "diabetique", etapes: ["Si consciente : donner du sucre (jus, bonbon)","Mettre au repos","Surveiller l'amélioration","Si inconsciente : PLS, ne rien donner par la bouche","Évacuer si pas d'amélioration"] },
      { titre: "AVC (Accident Vasculaire Cérébral)", titreKey: "proto.avc", emoji: "🧠", stepsKey: "avc", etapes: ["Reconnaître les signes : FAST (Face, Arm, Speech, Time)","Installer en position semi-assise","Ne rien donner à boire ni à manger","Noter l'heure de début des symptômes","Évacuation médicalisée URGENTE"] },
      { titre: "Réaction allergique grave (anaphylaxie)", titreKey: "proto.allergie", emoji: "🚨", stepsKey: "allergie", etapes: ["Identifier l'allergène et l'écarter","Si la victime a un auto-injecteur d'adrénaline : l'aider","Position semi-assise si gêne respiratoire","Allongée si chute de tension","Surveiller en continu","Évacuation d'urgence"] },
    ],
  },
  {
    nom: "Accidents de circulation", nomKey: "cat.circulation", emoji: "🚗",
    protocoles: [
      { titre: "Victime dans un véhicule", titreKey: "proto.victimeVehicule", emoji: "🚙", stepsKey: "victimeVehicule", etapes: ["Sécuriser la zone (triangle, gilet, feux de détresse)","Couper le contact du véhicule","Ne pas déplacer la victime sauf danger immédiat","Maintenir l'axe tête-cou-tronc","Couvrir et rassurer la victime","Attendre les secours spécialisés pour le désincarcération"] },
      { titre: "Piéton renversé", titreKey: "proto.pietonRenverse", emoji: "🚶", stepsKey: "pietonRenverse", etapes: ["Sécuriser la zone","Ne pas déplacer la victime","Bilan : conscience, respiration, hémorragies","Couvrir et rassurer","Surveiller en continu","Évacuation médicalisée"] },
      { titre: "Accident de moto / vélo", titreKey: "proto.accidentMoto", emoji: "🏍️", stepsKey: "accidentMoto", etapes: ["Ne pas retirer le casque (sauf arrêt respiratoire)","Maintenir l'axe tête-cou","Bilan complet des lésions","Immobiliser les fractures visibles","Surveiller les signes de choc","Évacuation médicalisée"] },
    ],
  },
  {
    nom: "Autres situations", nomKey: "cat.autres", emoji: "📋",
    protocoles: [
      { titre: "Jet de pierres / agression", titreKey: "proto.jetPierres", emoji: "🪨", stepsKey: "jetPierres", etapes: ["Assurer la sécurité de l'équipe en premier","Évaluer les blessures (crâne, visage, membres)","Traiter les plaies et hémorragies","Appliquer de la glace sur les contusions","Surveiller les signes de trauma crânien","Évacuer et signaler aux forces de l'ordre"] },
      { titre: "Intoxication", titreKey: "proto.intoxication", emoji: "☠️", stepsKey: "intoxication", etapes: ["Identifier le toxique si possible","Ne pas faire vomir","Aérer en cas d'inhalation","Appeler le centre antipoison","Garder l'emballage du produit","Surveiller conscience et respiration","Évacuation médicalisée"] },
      { titre: "Morsure de serpent / animal", titreKey: "proto.morsure", emoji: "🐍", stepsKey: "morsure", etapes: ["Calmer et immobiliser la victime","Immobiliser le membre mordu","Ne pas aspirer le venin, ne pas inciser","Ne pas poser de garrot","Nettoyer et désinfecter la plaie","Évacuer vers l'hôpital avec description de l'animal"] },
      { titre: "Accouchement inopiné", titreKey: "proto.accouchement", emoji: "👶", stepsKey: "accouchement", etapes: ["Installer la mère en position gynécologique","Préparer un espace propre et chaud","Guider la mère pour pousser pendant les contractions","Réceptionner le bébé sans tirer","Sécher et réchauffer le nouveau-né","Ne pas couper le cordon","Évacuer mère et enfant vers la maternité"] },
      { titre: "Coup de chaleur / insolation", titreKey: "proto.coupChaleur", emoji: "☀️", stepsKey: "coupChaleur", etapes: ["Mettre à l'ombre et au frais","Déshabiller et rafraîchir (linges humides)","Donner de l'eau fraîche par petites gorgées si consciente","Position allongée, jambes surélevées","Surveiller la température","Évacuer si confusion ou perte de conscience"] },
      { titre: "Hypothermie", titreKey: "proto.hypothermie", emoji: "❄️", stepsKey: "hypothermie", etapes: ["Mettre à l'abri du froid et du vent","Retirer les vêtements mouillés","Envelopper dans des couvertures","Réchauffement progressif (pas de chaleur directe)","Boissons chaudes sucrées si consciente","Évacuer si hypothermie sévère"] },
    ],
  },
];

const ConduiteATenir = () => {
  const [open, setOpen] = useState(false);
  const { t, lang, isRtl } = useLanguage();

  const getSteps = (proto: Protocole) => {
    if (lang === "ar" && stepsTranslations.ar[proto.stepsKey]) {
      return stepsTranslations.ar[proto.stepsKey];
    }
    return proto.etapes;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-semibold"
        >
          <BookOpen className="w-4 h-4" />
          {t("cat.title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] p-0" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="w-5 h-5" />
            {t("cat.title")}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="px-4 pb-4" style={{ maxHeight: "70vh" }}>
          <Accordion type="single" collapsible className="space-y-1">
            {CATEGORIES.map((cat, ci) => (
              <AccordionItem key={ci} value={`cat-${ci}`} className="border rounded-lg px-2">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  <span>{cat.emoji} {t(cat.nomKey)}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="space-y-1 pl-2">
                    {cat.protocoles.map((proto, pi) => (
                      <AccordionItem key={pi} value={`proto-${ci}-${pi}`} className={`${isRtl ? "border-r-2 pr-2" : "border-l-2 pl-2"} border-primary/20`}>
                        <AccordionTrigger className="text-xs font-medium hover:no-underline py-2">
                          <span>{proto.emoji} {t(proto.titreKey)}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ol className={`list-decimal ${isRtl ? "list-inside" : "list-inside"} space-y-1.5 text-xs text-muted-foreground ${isRtl ? "pr-1" : "pl-1"}`}>
                            {getSteps(proto).map((etape, ei) => (
                              <li key={ei} className="leading-relaxed">{etape}</li>
                            ))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ConduiteATenir;
