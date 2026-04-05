import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "fr" | "ar";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations: Record<string, Record<Lang, string>> = {
  // Header
  "header.title": { fr: "Protection Civile Nouaceur", ar: "الحماية المدنية النواصر" },
  "header.subtitle": { fr: "Fiche d'Intervention", ar: "بطاقة التدخل" },

  // Login
  "login.title": { fr: "Protection Civile Nouaceur", ar: "الحماية المدنية النواصر" },
  "login.subtitle": { fr: "Connectez-vous pour accéder à l'application", ar: "سجّل دخولك للوصول إلى التطبيق" },
  "login.username": { fr: "Identifiant", ar: "اسم المستخدم" },
  "login.password": { fr: "Mot de passe", ar: "كلمة المرور" },
  "login.usernamePlaceholder": { fr: "Entrez votre identifiant", ar: "أدخل اسم المستخدم" },
  "login.passwordPlaceholder": { fr: "Entrez votre mot de passe", ar: "أدخل كلمة المرور" },
  "login.submit": { fr: "Se connecter", ar: "تسجيل الدخول" },
  "login.error": { fr: "Identifiant ou mot de passe incorrect", ar: "اسم المستخدم أو كلمة المرور غير صحيحة" },
  "login.welcome": { fr: "Bienvenue !", ar: "!مرحباً" },
  "login.errorToast": { fr: "Identifiants incorrects", ar: "بيانات الدخول غير صحيحة" },
  "login.footer": { fr: "Créé par Ayoub Sadkouni", ar: "من إنشاء أيوب صدقوني" },

  // ConduiteATenir
  "cat.title": { fr: "Conduites à tenir", ar: "التصرفات الواجبة" },

  // Categories
  "cat.plaies": { fr: "Plaies & Hémorragies", ar: "الجروح والنزيف" },
  "cat.fractures": { fr: "Fractures & Traumatismes", ar: "الكسور والإصابات" },
  "cat.brulures": { fr: "Brûlures", ar: "الحروق" },
  "cat.respiratoire": { fr: "Détresse respiratoire", ar: "ضيق التنفس" },
  "cat.urgences": { fr: "Urgences médicales", ar: "الحالات الطبية الطارئة" },
  "cat.circulation": { fr: "Accidents de circulation", ar: "حوادث السير" },
  "cat.autres": { fr: "Autres situations", ar: "حالات أخرى" },

  // Protocoles - Plaies
  "proto.plaieSimple": { fr: "Plaie simple", ar: "جرح بسيط" },
  "proto.plaieGrave": { fr: "Plaie grave / profonde", ar: "جرح خطير / عميق" },
  "proto.hemorragie": { fr: "Hémorragie externe", ar: "نزيف خارجي" },

  // Protocoles - Fractures
  "proto.fractureMembre": { fr: "Fracture de membre", ar: "كسر في الأطراف" },
  "proto.traumaCranien": { fr: "Suspicion trauma crânien", ar: "اشتباه إصابة في الرأس" },
  "proto.traumaRachis": { fr: "Suspicion trauma du rachis", ar: "اشتباه إصابة في العمود الفقري" },

  // Protocoles - Brûlures
  "proto.brulureThermique": { fr: "Brûlure thermique", ar: "حرق حراري" },
  "proto.brulureChimique": { fr: "Brûlure chimique", ar: "حرق كيميائي" },
  "proto.electrocution": { fr: "Électrocution", ar: "صعق كهربائي" },

  // Protocoles - Respiratoire
  "proto.etouffement": { fr: "Étouffement (obstruction)", ar: "اختناق (انسداد)" },
  "proto.asthme": { fr: "Crise d'asthme", ar: "أزمة ربو" },
  "proto.noyade": { fr: "Noyade", ar: "غرق" },

  // Protocoles - Urgences
  "proto.arretCardiaque": { fr: "Arrêt cardiaque", ar: "سكتة قلبية" },
  "proto.epilepsie": { fr: "Crise d'épilepsie", ar: "نوبة صرع" },
  "proto.malaise": { fr: "Malaise / perte de connaissance", ar: "إغماء / فقدان الوعي" },
  "proto.diabetique": { fr: "Crise diabétique (hypoglycémie)", ar: "أزمة سكري (انخفاض السكر)" },
  "proto.avc": { fr: "AVC (Accident Vasculaire Cérébral)", ar: "سكتة دماغية" },
  "proto.allergie": { fr: "Réaction allergique grave (anaphylaxie)", ar: "حساسية شديدة (صدمة تأقية)" },

  // Protocoles - Circulation
  "proto.victimeVehicule": { fr: "Victime dans un véhicule", ar: "مصاب داخل مركبة" },
  "proto.pietonRenverse": { fr: "Piéton renversé", ar: "دهس مشاة" },
  "proto.accidentMoto": { fr: "Accident de moto / vélo", ar: "حادث دراجة نارية / هوائية" },

  // Protocoles - Autres
  "proto.jetPierres": { fr: "Jet de pierres / agression", ar: "رشق بالحجارة / اعتداء" },
  "proto.intoxication": { fr: "Intoxication", ar: "تسمم" },
  "proto.morsure": { fr: "Morsure de serpent / animal", ar: "لدغة أفعى / حيوان" },
  "proto.accouchement": { fr: "Accouchement inopiné", ar: "ولادة مفاجئة" },
  "proto.coupChaleur": { fr: "Coup de chaleur / insolation", ar: "ضربة شمس / حرارة" },
  "proto.hypothermie": { fr: "Hypothermie", ar: "انخفاض حرارة الجسم" },

  // Form sections
  "form.dateTime": { fr: "Date & Heure d'arrivée", ar: "التاريخ وساعة الوصول" },
  "form.date": { fr: "Date", ar: "التاريخ" },
  "form.time": { fr: "Heure", ar: "الساعة" },
  "form.location": { fr: "Localisation", ar: "الموقع" },
  "form.counter": { fr: "Compteur kilométrique", ar: "عداد الكيلومترات" },
  "form.counterPlaceholder": { fr: "Ex: 45230", ar: "مثال: 45230" },
  "form.accidentLocation": { fr: "Lieu de l'accident", ar: "مكان الحادث" },
  "form.accidentLocationPlaceholder": { fr: "Adresse ou description du lieu", ar: "العنوان أو وصف المكان" },
  "form.victimDanger": { fr: "Victime en danger", ar: "مصاب في خطر" },
  "form.selectType": { fr: "Sélectionner le type", ar: "اختر النوع" },
  "form.trafficAccident": { fr: "Accident de circulation", ar: "حادث سير" },
  "form.victims": { fr: "Victimes", ar: "المصابون" },
  "form.addVictim": { fr: "Ajouter", ar: "إضافة" },
  "form.victim": { fr: "Victime", ar: "مصاب" },
  "form.lastName": { fr: "Nom", ar: "الاسم العائلي" },
  "form.firstName": { fr: "Prénom", ar: "الاسم الشخصي" },
  "form.age": { fr: "Âge", ar: "العمر" },
  "form.state": { fr: "État", ar: "الحالة" },
  "form.light": { fr: "Léger", ar: "خفيف" },
  "form.severe": { fr: "Grave", ar: "خطير" },
  "form.idCard": { fr: "Carte d'identité (photo)", ar: "بطاقة التعريف (صورة)" },
  "form.takePhoto": { fr: "Prendre / Choisir photo", ar: "التقاط / اختيار صورة" },
  "form.emergencyNumber": { fr: "N° d'urgence", ar: "رقم الطوارئ" },
  "form.emergencyPlaceholder": { fr: "N° d'urgence", ar: "رقم الطوارئ" },
  "form.hospital": { fr: "Hôpital de destination", ar: "المستشفى المستقبل" },
  "form.hospitalPlaceholder": { fr: "Nom de l'hôpital", ar: "اسم المستشفى" },
  "form.lawEnforcement": { fr: "Forces de l'ordre sur le lieu", ar: "القوات الأمنية في المكان" },
  "form.policePresent": { fr: "Police présente", ar: "الشرطة حاضرة" },
  "form.gendarmeriePresent": { fr: "Gendarmerie présente", ar: "الدرك حاضر" },
  "form.observations": { fr: "Observations complémentaires", ar: "ملاحظات إضافية" },
  "form.observationsPlaceholder": { fr: "Notes, détails supplémentaires...", ar: "ملاحظات، تفاصيل إضافية..." },
  "form.interventionPhotos": { fr: "Photos de l'intervention", ar: "صور التدخل" },
  "form.add": { fr: "Ajouter", ar: "إضافة" },

  // Toasts
  "toast.shared": { fr: "Rapport partagé avec succès", ar: "تم مشاركة التقرير بنجاح" },
  "toast.whatsappOpen": { fr: "Ouverture de WhatsApp...", ar: "...جاري فتح واتساب" },
  "toast.pdfShared": { fr: "Rapport PDF partagé avec succès", ar: "تم مشاركة تقرير PDF بنجاح" },
  "toast.pdfDownloaded": { fr: "PDF téléchargé", ar: "تم تحميل PDF" },
  "toast.pdfError": { fr: "Erreur lors de la création du PDF", ar: "خطأ أثناء إنشاء PDF" },
  "toast.missingFields": { fr: "Champs obligatoires manquants", ar: "حقول إلزامية مفقودة" },

  // Footer
  "footer": { fr: "Créé par Ayoub Sadkouni", ar: "من إنشاء أيوب صدقوني" },

  // Victim types
  "vt.criseCardiaque": { fr: "Crise cardiaque", ar: "أزمة قلبية" },
  "vt.epilepsie": { fr: "Crise d'épilepsie", ar: "نوبة صرع" },
  "vt.asthme": { fr: "Crise d'asthme", ar: "أزمة ربو" },
  "vt.panique": { fr: "Crise de panique", ar: "نوبة هلع" },
  "vt.diabetique": { fr: "Crise diabétique", ar: "أزمة سكري" },
  "vt.blesseBagarre": { fr: "Blessé bagarre", ar: "إصابة شجار" },
  "vt.blesseChute": { fr: "Blessé chute", ar: "إصابة سقوط" },
  "vt.malaise": { fr: "Malaise", ar: "إغماء" },
  "vt.noyade": { fr: "Noyade", ar: "غرق" },
  "vt.brulure": { fr: "Brûlure", ar: "حرق" },
  "vt.electrocution": { fr: "Électrocution", ar: "صعق كهربائي" },
  "vt.intoxication": { fr: "Intoxication", ar: "تسمم" },
  "vt.suicide": { fr: "Tentative de suicide", ar: "محاولة انتحار" },
  "vt.accouchement": { fr: "Accouchement", ar: "ولادة" },
  "vt.etouffement": { fr: "Étouffement", ar: "اختناق" },
  "vt.hemorragie": { fr: "Hémorragie", ar: "نزيف" },
  "vt.morsure": { fr: "Morsure de serpent / animal", ar: "لدغة أفعى / حيوان" },
  "vt.allergie": { fr: "Allergie grave", ar: "حساسية شديدة" },
  "vt.autre": { fr: "Autre", ar: "أخرى" },

  // Accident types
  "ac.collision": { fr: "Collision entre deux véhicules", ar: "تصادم بين مركبتين" },
  "ac.carambolage": { fr: "Carambolage", ar: "تصادم متسلسل" },
  "ac.pieton": { fr: "Heurt de piéton", ar: "دهس مشاة" },
  "ac.renversement": { fr: "Renversement", ar: "انقلاب" },
  "ac.sortieRoute": { fr: "Sortie de route", ar: "خروج عن الطريق" },
  "ac.moto": { fr: "Accident de moto", ar: "حادث دراجة نارية" },
  "ac.velo": { fr: "Accident de vélo", ar: "حادث دراجة هوائية" },
  "ac.camion": { fr: "Accident de camion / poids lourd", ar: "حادث شاحنة" },
  "ac.bus": { fr: "Accident de bus / transport en commun", ar: "حادث حافلة / نقل عمومي" },
  "ac.frontale": { fr: "Collision frontale", ar: "تصادم أمامي" },
  "ac.laterale": { fr: "Collision latérale", ar: "تصادم جانبي" },
  "ac.tonneau": { fr: "Tonneau", ar: "انقلاب كامل" },
  "ac.autre": { fr: "Autre", ar: "أخرى" },
};

// Steps translations for ConduiteATenir
export const stepsTranslations: Record<Lang, Record<string, string[]>> = {
  fr: {},
  ar: {
    "plaieSimple": [
      "ارتداء القفازات",
      "تنظيف الجرح بالماء أو المحلول الملحي",
      "تطهير من المركز نحو الخارج",
      "وضع ضمادة معقمة",
      "التحقق من التطعيم ضد الكزاز",
    ],
    "plaieGrave": [
      "عدم إزالة أي جسم غريب",
      "تمديد المصاب",
      "تغطية الجرح بضمادة معقمة",
      "عدم إعطاء أي شراب أو طعام",
      "مراقبة علامات الصدمة",
      "الإجلاء سريعاً نحو المستشفى",
    ],
    "hemorragie": [
      "ضغط مباشر بقماش نظيف",
      "تمديد المصاب",
      "رفع الطرف إن أمكن",
      "العاصبة فقط كحل أخير (تسجيل الوقت)",
      "مراقبة حالة الوعي",
      "إجلاء عاجل",
    ],
    "fractureMembre": [
      "تثبيت الطرف في الوضعية الموجودة",
      "عدم محاولة إعادة التقويم",
      "استخدام جبيرة أو وشاح",
      "وضع ثلج (محمي) إن أمكن",
      "مراقبة الدورة الدموية (النبض، اللون، الإحساس)",
      "الإجلاء نحو المستشفى",
    ],
    "traumaCranien": [
      "عدم تحريك المصاب",
      "الحفاظ على محور الرأس-العنق-الجذع",
      "مراقبة الوعي (مقياس غلاسكو)",
      "وضعية الإفاقة إذا كان فاقداً للوعي ويتنفس",
      "تسجيل الوقت والتطور",
      "إجلاء طبي عاجل",
    ],
    "traumaRachis": [
      "عدم تحريك المصاب أبداً",
      "الحفاظ على الرأس في وضعية محايدة",
      "وضع طوق عنقي إن توفر",
      "انتظار التعزيزات الطبية",
      "مراقبة التنفس والوعي",
    ],
    "brulureThermique": [
      "تبريد تحت ماء فاتر (15-20°م) لمدة 10-15 دقيقة",
      "إزالة الملابس غير الملتصقة",
      "عدم ثقب الفقاعات",
      "تغطية بضمادة معقمة رطبة",
      "تقييم المساحة والعمق",
      "الإجلاء إذا كان الحرق خطيراً (أكثر من 10%، الوجه، اليدين، المفاصل)",
    ],
    "brulureChimique": [
      "غسل بالماء بغزارة لمدة 20 دقيقة على الأقل",
      "إزالة الملابس الملوثة",
      "عدم استخدام مادة معادلة",
      "حماية العينين إذا تأثرت",
      "إجلاء عاجل",
    ],
    "electrocution": [
      "قطع مصدر الكهرباء قبل أي تماس",
      "التحقق من الوعي والتنفس",
      "البحث عن نقاط الدخول والخروج",
      "مراقبة نبض القلب",
      "بدء الإنعاش القلبي الرئوي إذا لزم الأمر",
      "إجلاء طبي إلزامي",
    ],
    "etouffement": [
      "إذا كان المصاب يسعل: تشجيعه على السعال",
      "إذا لم ينفع: 5 ضربات على الظهر",
      "إذا فشل: 5 ضغطات بطنية (هايمليخ)",
      "التناوب بين الضربات والضغطات",
      "إذا فقد الوعي: بدء الإنعاش القلبي الرئوي",
    ],
    "asthme": [
      "وضع المصاب في وضعية الجلوس",
      "مساعدته على أخذ علاجه (موسع الشعب)",
      "طمأنة وتهدئة",
      "تهوية المكان",
      "إذا لم يتحسن في 5 دقائق: الإجلاء",
    ],
    "noyade": [
      "إخراج المصاب من الماء بأمان",
      "تمديد على الظهر وتحرير المجاري التنفسية",
      "بدء الإنعاش إذا توقف التنفس (5 نفخات أولاً)",
      "وضعية الإفاقة إذا كان يتنفس لكن فاقد الوعي",
      "تدفئة المصاب",
      "إجلاء طبي",
    ],
    "arretCardiaque": [
      "التحقق من الوعي والتنفس",
      "الاتصال بالإسعاف فوراً",
      "بدء تدليك القلب (100-120/دقيقة)",
      "استخدام مزيل الرجفان إن توفر",
      "التناوب 30 ضغطة / 2 نفخة",
      "عدم التوقف حتى وصول الإسعاف",
    ],
    "epilepsie": [
      "عدم تثبيت المصاب",
      "إبعاد الأشياء الخطرة",
      "حماية الرأس (وسادة، ملابس)",
      "عدم وضع أي شيء في الفم",
      "بعد النوبة: وضعية الإفاقة والمراقبة",
      "الإجلاء إذا تجاوزت النوبة 5 دقائق أو كانت الأولى",
    ],
    "malaise": [
      "تمديد المصاب ورفع الساقين",
      "فك الملابس",
      "تهوية وحماية من البرد/الحرارة",
      "إذا فقد الوعي ويتنفس: وضعية الإفاقة",
      "مراقبة مستمرة",
      "الاستفسار عن السوابق المرضية إذا كان واعياً",
    ],
    "diabetique": [
      "إذا كان واعياً: إعطاء سكر (عصير، حلوى)",
      "الراحة",
      "مراقبة التحسن",
      "إذا فقد الوعي: وضعية الإفاقة، عدم إعطاء أي شيء عن طريق الفم",
      "الإجلاء إذا لم يتحسن",
    ],
    "avc": [
      "التعرف على العلامات: FAST (الوجه، الذراع، الكلام، الوقت)",
      "وضعية نصف جالسة",
      "عدم إعطاء أي شراب أو طعام",
      "تسجيل وقت بداية الأعراض",
      "إجلاء طبي عاجل",
    ],
    "allergie": [
      "تحديد المسبب وإبعاده",
      "إذا كان لديه حقنة أدرينالين: مساعدته",
      "وضعية نصف جالسة إذا كان هناك ضيق تنفس",
      "تمديد إذا انخفض الضغط",
      "مراقبة مستمرة",
      "إجلاء عاجل",
    ],
    "victimeVehicule": [
      "تأمين المنطقة (مثلث، سترة، أضواء)",
      "إيقاف محرك المركبة",
      "عدم تحريك المصاب إلا في حالة خطر مباشر",
      "الحفاظ على محور الرأس-العنق-الجذع",
      "تغطية وطمأنة المصاب",
      "انتظار فرق الإنقاذ المتخصصة",
    ],
    "pietonRenverse": [
      "تأمين المنطقة",
      "عدم تحريك المصاب",
      "تقييم: الوعي، التنفس، النزيف",
      "تغطية وطمأنة",
      "مراقبة مستمرة",
      "إجلاء طبي",
    ],
    "accidentMoto": [
      "عدم إزالة الخوذة (إلا في حالة توقف التنفس)",
      "الحفاظ على محور الرأس-العنق",
      "تقييم شامل للإصابات",
      "تثبيت الكسور الظاهرة",
      "مراقبة علامات الصدمة",
      "إجلاء طبي",
    ],
    "jetPierres": [
      "تأمين سلامة الفريق أولاً",
      "تقييم الإصابات (الرأس، الوجه، الأطراف)",
      "معالجة الجروح والنزيف",
      "وضع ثلج على الكدمات",
      "مراقبة علامات إصابة الرأس",
      "الإجلاء والإبلاغ للسلطات الأمنية",
    ],
    "intoxication": [
      "تحديد المادة السامة إن أمكن",
      "عدم إجبار على التقيؤ",
      "تهوية في حالة الاستنشاق",
      "الاتصال بمركز مكافحة السموم",
      "الاحتفاظ بعبوة المنتج",
      "مراقبة الوعي والتنفس",
      "إجلاء طبي",
    ],
    "morsure": [
      "تهدئة المصاب وتثبيته",
      "تثبيت الطرف المصاب",
      "عدم مص السم أو الشق",
      "عدم وضع عاصبة",
      "تنظيف وتطهير الجرح",
      "الإجلاء نحو المستشفى مع وصف الحيوان",
    ],
    "accouchement": [
      "تمديد الأم في وضعية الولادة",
      "تحضير مكان نظيف ودافئ",
      "توجيه الأم للدفع أثناء الانقباضات",
      "استقبال الطفل دون شد",
      "تجفيف وتدفئة المولود",
      "عدم قطع الحبل السري",
      "إجلاء الأم والطفل نحو مصحة الولادة",
    ],
    "coupChaleur": [
      "الانتقال إلى الظل والبرودة",
      "خلع الملابس والتبريد (مناشف مبللة)",
      "إعطاء ماء بارد رشفات صغيرة إذا كان واعياً",
      "وضعية الاستلقاء مع رفع الساقين",
      "مراقبة الحرارة",
      "الإجلاء إذا ظهر ارتباك أو فقدان الوعي",
    ],
    "hypothermie": [
      "الاحتماء من البرد والرياح",
      "إزالة الملابس المبللة",
      "لف بالأغطية",
      "تدفئة تدريجية (بدون حرارة مباشرة)",
      "مشروبات ساخنة محلاة إذا كان واعياً",
      "الإجلاء إذا كان الانخفاض شديداً",
    ],
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem("pc_lang") as Lang) || "fr";
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("pc_lang", l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, isRtl: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

// Helper: get victim type translations
export const getVictimTypes = (lang: Lang) => {
  const keys = [
    "vt.criseCardiaque", "vt.epilepsie", "vt.asthme", "vt.panique", "vt.diabetique",
    "vt.blesseBagarre", "vt.blesseChute", "vt.malaise", "vt.noyade", "vt.brulure",
    "vt.electrocution", "vt.intoxication", "vt.suicide", "vt.accouchement",
    "vt.etouffement", "vt.hemorragie", "vt.morsure", "vt.allergie", "vt.autre",
  ];
  return keys.map((k) => translations[k]?.[lang] || k);
};

export const getAccidentTypes = (lang: Lang) => {
  const keys = [
    "ac.collision", "ac.carambolage", "ac.pieton", "ac.renversement", "ac.sortieRoute",
    "ac.moto", "ac.velo", "ac.camion", "ac.bus", "ac.frontale", "ac.laterale",
    "ac.tonneau", "ac.autre",
  ];
  return keys.map((k) => translations[k]?.[lang] || k);
};
