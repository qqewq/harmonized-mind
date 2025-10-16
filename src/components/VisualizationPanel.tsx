import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from "recharts";
import { TrendingUp, BarChart3, Zap } from "lucide-react";

interface Hypothesis {
  id: number;
  description: string;
  pTotal: number;
  gamma: number;
  resonancePoint: number;
  status: "optimal" | "suboptimal" | "rejected";
}

interface VisualizationPanelProps {
  hypotheses: Hypothesis[];
  domains?: string[];
}

export const VisualizationPanel = ({ hypotheses, domains = [] }: VisualizationPanelProps) => {
  // Prepare scatter plot data (Γ vs P_total)
  const scatterData = hypotheses.map((h) => ({
    name: `H${h.id}`,
    gamma: h.gamma,
    pTotal: h.pTotal,
    status: h.status,
    resonancePoint: h.resonancePoint
  }));

  // Prepare bar chart data (ω_рез by domain approximation)
  const resonanceByDomain = domains.map((domain, index) => ({
    domain: domain,
    resonance: hypotheses[index]?.resonancePoint || 0,
    gamma: hypotheses[index]?.gamma || 0
  }));

  // Color mapping for statuses
  const statusColors = {
    optimal: "hsl(var(--success))",
    suboptimal: "hsl(var(--warning))",
    rejected: "hsl(var(--destructive))"
  };

  // Custom tooltip for scatter plot
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 bg-card border-primary shadow-glow-primary">
          <div className="space-y-1 text-sm">
            <div className="font-bold text-foreground">{data.name}</div>
            <div className="text-muted-foreground">
              Γ: <span className="text-primary font-mono">{data.gamma.toFixed(4)}</span>
            </div>
            <div className="text-muted-foreground">
              P<sub>total</sub>: <span className="text-secondary font-mono">{data.pTotal.toFixed(6)}</span>
            </div>
            <div className="text-muted-foreground">
              ω<sub>рез</sub>: <span className="text-accent font-mono">{data.resonancePoint.toFixed(4)}</span>
            </div>
            <Badge className={`${data.status === 'optimal' ? 'bg-success/20 text-success' : data.status === 'suboptimal' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>
              {data.status}
            </Badge>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary animate-pulse-glow" />
          Визуализация резонансного анализа
        </h2>
      </div>

      {/* Scatter Plot: Γ vs P_total */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">
              Баланс эффективности и этики (Γ vs P<sub>total</sub>)
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Scatter plot показывает корреляцию между резонансным показателем Γ и вероятностью P<sub>total</sub>
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="gamma"
                name="Γ (Гамма)"
                stroke="hsl(var(--foreground))"
                label={{ value: 'Γ (Гамма)', position: 'insideBottom', offset: -10, fill: 'hsl(var(--foreground))' }}
              />
              <YAxis
                type="number"
                dataKey="pTotal"
                name="P_total"
                stroke="hsl(var(--foreground))"
                label={{ value: 'P_total', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Гипотезы" data={scatterData} fill="hsl(var(--primary))">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.status]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.optimal }}></div>
              <span className="text-muted-foreground">Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.suboptimal }}></div>
              <span className="text-muted-foreground">Suboptimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors.rejected }}></div>
              <span className="text-muted-foreground">Rejected</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bar Chart: ω_рез by domains */}
      {resonanceByDomain.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              <h3 className="text-xl font-bold text-foreground">
                Резонансные точки по доменам (ω<sub>рез</sub>)
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Столбчатая диаграмма показывает точки усиления в различных областях знаний
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={resonanceByDomain} margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="domain"
                  stroke="hsl(var(--foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  label={{ value: 'ω_рез', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar dataKey="resonance" fill="hsl(var(--secondary))" name="ω_рез" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Foam of Mind Animation */}
      <Card className="p-6 bg-gradient-primary border-primary/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-foreground animate-pulse-glow" />
            <h3 className="text-xl font-bold text-primary-foreground">
              Пена разума (Mind Foam)
            </h3>
          </div>
          <p className="text-sm text-primary-foreground/80 mb-4">
            Визуализация амплитуд колебаний c<sub>i</sub> в различных доменах знаний
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {domains.map((domain, index) => {
              const amplitude = Math.random() * 100;
              const frequency = 1 + Math.random() * 2;
              return (
                <div
                  key={domain}
                  className="relative p-4 bg-primary-foreground/10 rounded-lg border border-primary-foreground/20 overflow-hidden"
                  style={{
                    animation: `pulse ${frequency}s cubic-bezier(0.4, 0, 0.6, 1) infinite`
                  }}
                >
                  <div className="relative z-10">
                    <div className="text-xs font-medium text-primary-foreground/70 mb-2">
                      {domain}
                    </div>
                    <div className="text-2xl font-bold text-primary-foreground font-mono">
                      {amplitude.toFixed(1)}%
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-primary-foreground/20 to-transparent"
                    style={{
                      animation: `float ${2 + Math.random()}s ease-in-out infinite`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
