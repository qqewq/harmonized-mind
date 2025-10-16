import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Zap, AlertTriangle } from "lucide-react";

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
}

export const ResultsPanel = ({ hypotheses, recommendation, stressTest }: ResultsPanelProps) => {
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

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary animate-pulse-glow" />
          Результаты анализа ГРА
        </h2>
        <Badge variant="outline" className="text-primary border-primary">
          Топ-{hypotheses.length} из 10^50
        </Badge>
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
    </div>
  );
};
