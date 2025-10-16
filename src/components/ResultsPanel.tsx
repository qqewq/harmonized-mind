import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, Zap, AlertTriangle, Download, FileJson } from "lucide-react";
import { VisualizationPanel } from "@/components/VisualizationPanel";
import { toast } from "sonner";

interface Hypothesis {
  id: number;
  description: string;
  pTotal: number;
  gamma: number;
  resonancePoint: number;
  status: "optimal" | "suboptimal" | "rejected";
}

interface ResultsPanelProps {
  hypotheses: Hypothesis[];
  recommendation: string;
  stressTest?: {
    gammaInv: number;
    status: string;
  };
  domains?: string[];
  task?: string;
  goal?: string;
}

export const ResultsPanel = ({ hypotheses, recommendation, stressTest, domains = [], task = "", goal = "" }: ResultsPanelProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-success/20 text-success border-success/50";
      case "suboptimal":
        return "bg-warning/20 text-warning border-warning/50";
      default:
        return "bg-destructive/20 text-destructive border-destructive/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal":
        return <CheckCircle2 className="w-4 h-4" />;
      case "suboptimal":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const exportToJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      task,
      goal,
      domains,
      hypotheses: hypotheses.map(h => ({
        id: h.id,
        description: h.description,
        metrics: {
          pTotal: h.pTotal,
          gamma: h.gamma,
          resonancePoint: h.resonancePoint
        },
        status: h.status
      })),
      recommendation,
      stressTest
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GRA-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Анализ экспортирован в JSON");
  };

  const exportToPDF = () => {
    // Simple text-based export (можно улучшить с помощью библиотеки jsPDF)
    const content = `
АНАЛИЗ ГРА - ${new Date().toLocaleString('ru-RU')}
═══════════════════════════════════════════════════════

ЗАДАЧА: ${task}
ЦЕЛЬ: ${goal}
ДОМЕНЫ: ${domains.join(', ')}

ГИПОТЕЗЫ (топ-${hypotheses.length} из 10^50):
${hypotheses.map(h => `
─────────────────────────────────────────────────────
Гипотеза #${h.id} [${h.status.toUpperCase()}]
Описание: ${h.description}
  • P_total: ${h.pTotal.toFixed(6)}
  • Γ (Гамма): ${h.gamma.toFixed(4)}
  • ω_рез: ${h.resonancePoint.toFixed(4)}
`).join('')}

РЕКОМЕНДАЦИЯ:
${recommendation}

${stressTest ? `СТРЕСС-ТЕСТ:
Γ_отр: ${stressTest.gammaInv.toFixed(4)}
Статус: ${stressTest.status}` : ''}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GRA-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Анализ экспортирован в текстовый файл");
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary animate-pulse-glow" />
            Результаты анализа ГРА
          </h2>
          <Badge variant="outline" className="text-primary border-primary">
            Топ-{hypotheses.length} из 10^50
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToJSON}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </Button>
          <Button
            onClick={exportToPDF}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Текст
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {hypotheses.map((hyp, index) => (
          <Card
            key={hyp.id}
            className="p-6 bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow-primary"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <Badge className={getStatusColor(hyp.status)}>
                  {getStatusIcon(hyp.status)}
                  <span className="ml-1 capitalize">{hyp.status}</span>
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Γ (Гамма)</div>
                <div className={`text-lg font-bold ${hyp.gamma > 0 ? 'text-success' : 'text-destructive'}`}>
                  {hyp.gamma.toFixed(4)}
                </div>
              </div>
            </div>

            <p className="text-foreground mb-4">{hyp.description}</p>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <div>
                <div className="text-sm text-muted-foreground mb-1">P<sub>total</sub></div>
                <div className="text-lg font-mono font-semibold text-primary">
                  {hyp.pTotal.toFixed(6)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">ω<sub>рез</sub></div>
                <div className="text-lg font-mono font-semibold text-secondary">
                  {hyp.resonancePoint.toFixed(4)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-accent border-accent">
        <h3 className="text-xl font-bold text-accent-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Рекомендация
        </h3>
        <p className="text-accent-foreground/90 leading-relaxed">{recommendation}</p>
      </Card>

      {stressTest && (
        <Card className="p-6 bg-card border-destructive/50">
          <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Стресс-тест (инвертированная сущность)
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Γ<sub>отр</sub></span>
              <span className="font-mono font-bold text-destructive">{stressTest.gammaInv.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Статус</span>
              <Badge variant="outline" className="border-destructive text-destructive">
                {stressTest.status}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Visualization Panel */}
      {hypotheses.length > 0 && (
        <VisualizationPanel hypotheses={hypotheses} domains={domains} />
      )}
    </div>
  );
};
