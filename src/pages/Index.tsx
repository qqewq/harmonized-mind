import { useState } from "react";
import { InputForm } from "@/components/InputForm";
import { Brain, GitBranch, CheckCircle2, XCircle, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

interface GRAResponse {
  status: "success" | "blocked";
  message?: string;
  solution?: string;
  prompt?: string;
  Gamma_foam?: number;
  P_total?: number;
  top_amplitude?: number;
}

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<GRAResponse | null>(null);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  const performAnalysis = async (prompt: string) => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const response = await fetch('https://harmonized-mind.onrender.com/api/run-gra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, lang: language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GRAResponse = await response.json();
      setResults(data);

      if (data.status === "success") {
        toast.success(language === 'ru' ? "Анализ ГРА завершен успешно" : "HRA analysis completed successfully");
      } else {
        toast.warning(language === 'ru' ? "Решение заблокировано этической системой" : "Solution blocked by ethical system");
      }
    } catch (error) {
      console.error('Error in GRA analysis:', error);
      toast.error(language === 'ru' ? "Ошибка при выполнении анализа ГРА" : "Error performing HRA analysis");
      setResults({
        status: "blocked",
        message: language === 'ru' ? "Не удалось подключиться к серверу ГРА" : "Failed to connect to HRA server"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="w-8 h-8 text-primary animate-float" />
                <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
                <p className="text-sm text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-lg hover:bg-accent"
                title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
              >
                {language === 'ru' ? '🇷🇺' : '🇬🇧'}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitBranch className="w-4 h-4" />
                <span className="font-mono">{t.version}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Info Card */}
          <div className="bg-gradient-primary p-6 rounded-xl text-primary-foreground shadow-glow-primary">
            <h2 className="text-xl font-bold mb-2">{t.heroTitle}</h2>
            <p className="text-sm leading-relaxed opacity-90">
              {t.heroDescription}
            </p>
          </div>

          {/* Input Form */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            <InputForm onAnalyze={performAnalysis} isLoading={isAnalyzing} language={language} />
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <Card className="p-8 bg-card border-border">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg text-muted-foreground">
                  {t.analyzing}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.analyzingSubtext}
                </p>
              </div>
            </Card>
          )}

          {/* Results */}
          {results && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              {results.status === "success" ? (
                <Card className="p-6 bg-card border-success">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                          {t.successTitle}
                          <Badge variant="outline" className="border-success text-success">
                            {t.successBadge}
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t.requestLabel} {results.prompt}
                        </p>
                      </div>
                      
                      <div className="bg-background/50 rounded-lg p-4 border border-border">
                        <h4 className="font-semibold text-foreground mb-2">{t.solutionLabel}</h4>
                        <div className="text-foreground whitespace-pre-line">
                          {results.solution}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">{t.metricGammaFoam}</div>
                          <div className="text-lg font-mono font-semibold text-success">
                            {results.Gamma_foam?.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">{t.metricPTotal}</div>
                          <div className="text-lg font-mono font-semibold text-primary">
                            {results.P_total?.toFixed(3)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">{t.metricAmplitude}</div>
                          <div className="text-lg font-mono font-semibold text-secondary">
                            {results.top_amplitude?.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-card border-destructive">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <XCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                        {t.blockedTitle}
                        <Badge variant="outline" className="border-destructive text-destructive">
                          {t.blockedBadge}
                        </Badge>
                      </h3>
                      <p className="text-foreground/90">
                        {results.message || t.blockedDefault}
                      </p>
                      
                      {/* Metrics if available */}
                      {(results.Gamma_foam !== undefined || results.P_total !== undefined) && (
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                          {results.Gamma_foam !== undefined && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">{t.metricGammaFoam}</div>
                              <div className="text-lg font-mono font-semibold text-destructive">
                                {results.Gamma_foam.toFixed(2)}
                              </div>
                            </div>
                          )}
                          {results.P_total !== undefined && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">{t.metricPTotal}</div>
                              <div className="text-lg font-mono font-semibold text-destructive">
                                {results.P_total.toFixed(3)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-4 p-4 bg-background/50 rounded-lg border border-destructive/30">
                        <p className="text-sm text-muted-foreground">
                          <strong>{t.blockedReasons}</strong><br/>
                          • {t.blockedReason1}<br/>
                          • {t.blockedReason2}<br/>
                          • {t.blockedReason3}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t.footerTitle}</p>
          <p className="mt-1">{t.footerSubtitle}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
