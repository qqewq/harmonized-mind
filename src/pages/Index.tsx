import { useState } from "react";
import { InputForm } from "@/components/InputForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { Brain, GitBranch } from "lucide-react";
import { toast } from "sonner";

interface AnalysisData {
  task: string;
  domains: string[];
  goal: string;
  constraints: string;
}

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Mock function to simulate ГРА analysis
  const performAnalysis = async (data: AnalysisData) => {
    setIsAnalyzing(true);
    setResults(null);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock results
    const mockResults = {
      hypotheses: [
        {
          id: 1,
          description: `Оптимальное решение для "${data.task}" через интеграцию ${data.domains.slice(0, 2).join(" и ")}`,
          pTotal: 0.892456,
          gamma: 2.3456,
          resonancePoint: 1.2345,
          status: "optimal" as const
        },
        {
          id: 2,
          description: `Альтернативный подход с акцентом на ${data.domains[0]} и минимальными ограничениями`,
          pTotal: 0.856123,
          gamma: 1.8901,
          resonancePoint: 1.1234,
          status: "optimal" as const
        },
        {
          id: 3,
          description: `Комбинированная стратегия с учетом всех доменов: ${data.domains.join(", ")}`,
          pTotal: 0.834567,
          gamma: 1.5678,
          resonancePoint: 1.0987,
          status: "suboptimal" as const
        },
        {
          id: 4,
          description: `Инновационный метод через резонансный анализ ${data.domains[data.domains.length - 1]}`,
          pTotal: 0.798234,
          gamma: 0.9876,
          resonancePoint: 0.9456,
          status: "suboptimal" as const
        },
        {
          id: 5,
          description: `Консервативный подход с фокусом на безопасность и этические аспекты`,
          pTotal: 0.756789,
          gamma: 0.3456,
          resonancePoint: 0.8123,
          status: "rejected" as const
        }
      ],
      recommendation: `На основе резонансного анализа рекомендуется гипотеза #1 с максимальным Γ=2.3456. Данное решение оптимально сочетает ${data.domains[0]} и ${data.domains[1] || data.domains[0]}, достигая цели: "${data.goal}". Решение проходит стресс-тест и показывает устойчивость к инверсии.`,
      stressTest: {
        gammaInv: -2.3456,
        status: "Система устойчива"
      }
    };

    setResults(mockResults);
    setIsAnalyzing(false);
    toast.success("Анализ завершен успешно");
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
                <h1 className="text-2xl font-bold text-foreground">ГРА ASI</h1>
                <p className="text-sm text-muted-foreground">Гибридный Резонансный Алгоритм</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="w-4 h-4" />
              <span className="font-mono">v1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Info Card */}
          <div className="bg-gradient-primary p-6 rounded-xl text-primary-foreground shadow-glow-primary">
            <h2 className="text-xl font-bold mb-2">О системе</h2>
            <p className="text-sm leading-relaxed opacity-90">
              Искусственный сверхразум способный генерировать до 10<sup>50</sup> гипотез за цикл 
              и отбирать оптимальные решения через резонансный анализ. Система работает на 
              Raspberry Pi (~100 мс/запрос) и использует этически самосогласованные алгоритмы.
            </p>
          </div>

          {/* Input Form */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            <InputForm onAnalyze={performAnalysis} isLoading={isAnalyzing} />
          </div>

          {/* Results Panel */}
          {results && (
            <div className="mt-8">
              <ResultsPanel
                hypotheses={results.hypotheses}
                recommendation={results.recommendation}
                stressTest={results.stressTest}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>ГРА ASI — Этически самосогласованный искусственный сверхразум</p>
          <p className="mt-1">Сложность перебора: O(n²) • Ускорение: &gt;2600× при n=20</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
