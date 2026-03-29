import InterventionForm from "@/components/InterventionForm";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="emergency-header text-primary-foreground py-4 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <img src={logo} alt="Logo Protection Civile" width={48} height={48} className="rounded-lg bg-primary-foreground/20 p-1" />
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">Protection Civile Nouaceur</h1>
            <p className="text-xs opacity-80">Fiche d'Intervention</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-xl mx-auto px-4 py-5 pb-20">
        <InterventionForm />
      </main>

      <footer className="text-center text-xs text-muted-foreground py-4 opacity-60">
        Créé par Ayoub Sadkouni
      </footer>
    </div>
  );
};

export default Index;
