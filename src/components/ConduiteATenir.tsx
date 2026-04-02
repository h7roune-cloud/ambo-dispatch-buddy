import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen } from "lucide-react";

interface Protocole {
  titre: string;
  emoji: string;
  etapes: string[];
}

interface Categorie {
  nom: string;
  emoji: string;
  protocoles: Protocole[];
}

const CATEGORIES: Categorie[] = [
  {
    nom: "Plaies & Hémorragies",
    emoji: "🩸",
    protocoles: [
      {
        titre: "Plaie simple",
        emoji: "🩹",
        etapes: [
          "Mettre des gants",
          "Nettoyer la plaie à l'eau ou sérum physiologique",
          "Désinfecter du centre vers l'extérieur",
          "Appliquer un pansement stérile",
          "Vérifier la vaccination antitétanique",
        ],
      },
      {
        titre: "Plaie grave / profonde",
        emoji: "🔴",
        etapes: [
          "Ne pas retirer un corps étranger",
          "Allonger la victime",
          "Couvrir la plaie avec un pansement stérile",
          "Ne rien donner à boire ni à manger",
          "Surveiller les signes de choc",
          "Évacuer rapidement vers l'hôpital",
        ],
      },
      {
        titre: "Hémorragie externe",
        emoji: "💉",
        etapes: [
          "Compression directe avec un tissu propre",
          "Allonger la victime",
          "Surélever le membre si possible",
          "Garrot uniquement en dernier recours (noter l'heure)",
          "Surveiller l'état de conscience",
          "Évacuer d'urgence",
        ],
      },
    ],
  },
  {
    nom: "Fractures & Traumatismes",
    emoji: "🦴",
    protocoles: [
      {
        titre: "Fracture de membre",
        emoji: "🦵",
        etapes: [
          "Immobiliser le membre dans la position trouvée",
          "Ne pas tenter de réaligner",
          "Utiliser une attelle ou écharpe",
          "Appliquer de la glace (protégée) si possible",
          "Surveiller la circulation en aval (pouls, couleur, sensibilité)",
          "Évacuer vers l'hôpital",
        ],
      },
      {
        titre: "Suspicion trauma crânien",
        emoji: "🧠",
        etapes: [
          "Ne pas bouger la victime",
          "Maintenir l'axe tête-cou-tronc",
          "Surveiller la conscience (score de Glasgow)",
          "Mettre en PLS si inconsciente mais respire",
          "Noter l'heure et l'évolution",
          "Évacuation médicalisée urgente",
        ],
      },
      {
        titre: "Suspicion trauma du rachis",
        emoji: "🔒",
        etapes: [
          "Ne jamais mobiliser la victime",
          "Maintenir la tête en position neutre",
          "Poser un collier cervical si disponible",
          "Attendre les renforts médicalisés",
          "Surveiller respiration et conscience",
        ],
      },
    ],
  },
  {
    nom: "Brûlures",
    emoji: "🔥",
    protocoles: [
      {
        titre: "Brûlure thermique",
        emoji: "♨️",
        etapes: [
          "Refroidir sous l'eau tiède (15-20°C) pendant 10-15 min",
          "Retirer vêtements non collés",
          "Ne pas percer les cloques",
          "Couvrir avec un pansement stérile humide",
          "Évaluer la surface et la profondeur",
          "Évacuer si brûlure grave (>10%, visage, mains, articulations)",
        ],
      },
      {
        titre: "Brûlure chimique",
        emoji: "⚗️",
        etapes: [
          "Rincer abondamment à l'eau pendant 20 min minimum",
          "Retirer les vêtements contaminés",
          "Ne pas utiliser de neutralisant",
          "Protéger les yeux si atteints",
          "Évacuer d'urgence",
        ],
      },
      {
        titre: "Électrocution",
        emoji: "⚡",
        etapes: [
          "Couper la source électrique AVANT tout contact",
          "Vérifier la conscience et la respiration",
          "Rechercher les points d'entrée et de sortie",
          "Surveiller le rythme cardiaque",
          "Commencer la RCP si nécessaire",
          "Évacuation médicalisée obligatoire",
        ],
      },
    ],
  },
  {
    nom: "Détresse respiratoire",
    emoji: "🫁",
    protocoles: [
      {
        titre: "Étouffement (obstruction)",
        emoji: "😰",
        etapes: [
          "Si la victime tousse : encourager à tousser",
          "Si inefficace : 5 claques dans le dos",
          "Si échec : 5 compressions abdominales (Heimlich)",
          "Alterner claques/compressions",
          "Si inconscience : commencer la RCP",
        ],
      },
      {
        titre: "Crise d'asthme",
        emoji: "💨",
        etapes: [
          "Mettre la victime en position assise",
          "Aider à prendre son traitement (bronchodilatateur)",
          "Rassurer et calmer",
          "Aérer la pièce",
          "Si pas d'amélioration en 5 min : évacuer",
        ],
      },
      {
        titre: "Noyade",
        emoji: "🌊",
        etapes: [
          "Sortir la victime de l'eau en sécurité",
          "Allonger sur le dos, dégager les voies aériennes",
          "Commencer la RCP si arrêt respiratoire (5 insufflations d'abord)",
          "Mettre en PLS si respire mais inconsciente",
          "Réchauffer la victime",
          "Évacuation médicalisée",
        ],
      },
    ],
  },
  {
    nom: "Urgences médicales",
    emoji: "🏥",
    protocoles: [
      {
        titre: "Arrêt cardiaque",
        emoji: "❤️",
        etapes: [
          "Vérifier la conscience et la respiration",
          "Appeler les secours immédiatement",
          "Commencer le massage cardiaque (100-120/min)",
          "Utiliser un DAE si disponible",
          "Alterner 30 compressions / 2 insufflations",
          "Ne pas s'arrêter jusqu'à l'arrivée des secours",
        ],
      },
      {
        titre: "Crise d'épilepsie",
        emoji: "⚡",
        etapes: [
          "Ne pas maintenir la victime",
          "Écarter les objets dangereux",
          "Protéger la tête (coussin, vêtement)",
          "Ne rien mettre dans la bouche",
          "Après la crise : PLS et surveiller",
          "Évacuer si crise > 5 min ou si première crise",
        ],
      },
      {
        titre: "Malaise / perte de connaissance",
        emoji: "😵",
        etapes: [
          "Allonger la victime, surélever les jambes",
          "Desserrer les vêtements",
          "Aérer et protéger du froid/chaleur",
          "Si inconsciente et respire : PLS",
          "Surveiller en continu",
          "Interroger sur les antécédents si consciente",
        ],
      },
      {
        titre: "Crise diabétique (hypoglycémie)",
        emoji: "🍬",
        etapes: [
          "Si consciente : donner du sucre (jus, bonbon)",
          "Mettre au repos",
          "Surveiller l'amélioration",
          "Si inconsciente : PLS, ne rien donner par la bouche",
          "Évacuer si pas d'amélioration",
        ],
      },
      {
        titre: "AVC (Accident Vasculaire Cérébral)",
        emoji: "🧠",
        etapes: [
          "Reconnaître les signes : FAST (Face, Arm, Speech, Time)",
          "Installer en position semi-assise",
          "Ne rien donner à boire ni à manger",
          "Noter l'heure de début des symptômes",
          "Évacuation médicalisée URGENTE",
        ],
      },
      {
        titre: "Réaction allergique grave (anaphylaxie)",
        emoji: "🚨",
        etapes: [
          "Identifier l'allergène et l'écarter",
          "Si la victime a un auto-injecteur d'adrénaline : l'aider",
          "Position semi-assise si gêne respiratoire",
          "Allongée si chute de tension",
          "Surveiller en continu",
          "Évacuation d'urgence",
        ],
      },
    ],
  },
  {
    nom: "Accidents de circulation",
    emoji: "🚗",
    protocoles: [
      {
        titre: "Victime dans un véhicule",
        emoji: "🚙",
        etapes: [
          "Sécuriser la zone (triangle, gilet, feux de détresse)",
          "Couper le contact du véhicule",
          "Ne pas déplacer la victime sauf danger immédiat",
          "Maintenir l'axe tête-cou-tronc",
          "Couvrir et rassurer la victime",
          "Attendre les secours spécialisés pour le désincarcération",
        ],
      },
      {
        titre: "Piéton renversé",
        emoji: "🚶",
        etapes: [
          "Sécuriser la zone",
          "Ne pas déplacer la victime",
          "Bilan : conscience, respiration, hémorragies",
          "Couvrir et rassurer",
          "Surveiller en continu",
          "Évacuation médicalisée",
        ],
      },
      {
        titre: "Accident de moto / vélo",
        emoji: "🏍️",
        etapes: [
          "Ne pas retirer le casque (sauf arrêt respiratoire)",
          "Maintenir l'axe tête-cou",
          "Bilan complet des lésions",
          "Immobiliser les fractures visibles",
          "Surveiller les signes de choc",
          "Évacuation médicalisée",
        ],
      },
    ],
  },
  {
    nom: "Autres situations",
    emoji: "📋",
    protocoles: [
      {
        titre: "Jet de pierres / agression",
        emoji: "🪨",
        etapes: [
          "Assurer la sécurité de l'équipe en premier",
          "Évaluer les blessures (crâne, visage, membres)",
          "Traiter les plaies et hémorragies",
          "Appliquer de la glace sur les contusions",
          "Surveiller les signes de trauma crânien",
          "Évacuer et signaler aux forces de l'ordre",
        ],
      },
      {
        titre: "Intoxication",
        emoji: "☠️",
        etapes: [
          "Identifier le toxique si possible",
          "Ne pas faire vomir",
          "Aérer en cas d'inhalation",
          "Appeler le centre antipoison",
          "Garder l'emballage du produit",
          "Surveiller conscience et respiration",
          "Évacuation médicalisée",
        ],
      },
      {
        titre: "Morsure de serpent / animal",
        emoji: "🐍",
        etapes: [
          "Calmer et immobiliser la victime",
          "Immobiliser le membre mordu",
          "Ne pas aspirer le venin, ne pas inciser",
          "Ne pas poser de garrot",
          "Nettoyer et désinfecter la plaie",
          "Évacuer vers l'hôpital avec description de l'animal",
        ],
      },
      {
        titre: "Accouchement inopiné",
        emoji: "👶",
        etapes: [
          "Installer la mère en position gynécologique",
          "Préparer un espace propre et chaud",
          "Guider la mère pour pousser pendant les contractions",
          "Réceptionner le bébé sans tirer",
          "Sécher et réchauffer le nouveau-né",
          "Ne pas couper le cordon",
          "Évacuer mère et enfant vers la maternité",
        ],
      },
      {
        titre: "Coup de chaleur / insolation",
        emoji: "☀️",
        etapes: [
          "Mettre à l'ombre et au frais",
          "Déshabiller et rafraîchir (linges humides)",
          "Donner de l'eau fraîche par petites gorgées si consciente",
          "Position allongée, jambes surélevées",
          "Surveiller la température",
          "Évacuer si confusion ou perte de conscience",
        ],
      },
      {
        titre: "Hypothermie",
        emoji: "❄️",
        etapes: [
          "Mettre à l'abri du froid et du vent",
          "Retirer les vêtements mouillés",
          "Envelopper dans des couvertures",
          "Réchauffement progressif (pas de chaleur directe)",
          "Boissons chaudes sucrées si consciente",
          "Évacuer si hypothermie sévère",
        ],
      },
    ],
  },
];

const ConduiteATenir = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-semibold"
        >
          <BookOpen className="w-4 h-4" />
          Conduites à tenir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="w-5 h-5" />
            Conduites à tenir
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="px-4 pb-4" style={{ maxHeight: "70vh" }}>
          <Accordion type="single" collapsible className="space-y-1">
            {CATEGORIES.map((cat, ci) => (
              <AccordionItem key={ci} value={`cat-${ci}`} className="border rounded-lg px-2">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  <span>{cat.emoji} {cat.nom}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="space-y-1 pl-2">
                    {cat.protocoles.map((proto, pi) => (
                      <AccordionItem key={pi} value={`proto-${ci}-${pi}`} className="border-l-2 border-primary/20 pl-2">
                        <AccordionTrigger className="text-xs font-medium hover:no-underline py-2">
                          <span>{proto.emoji} {proto.titre}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground pl-1">
                            {proto.etapes.map((etape, ei) => (
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
