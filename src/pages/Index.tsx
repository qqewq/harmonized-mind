import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InputForm } from "@/components/InputForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Brain, GitBranch, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AnalysisData {
  task: string;
  domains: string[];
  goal: string;
  constraints: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("new");

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  // Load analysis from history
  const loadAnalysis = async (analysisId: string) => {
    try {
      // Load analysis data
      const { data: analysis, error: analysisError } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (analysisError) throw analysisError;

      // Load hypotheses for this analysis
      const { data: hypotheses, error: hypothesesError } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('rank');

      if (hypothesesError) throw hypothesesError;

      // Format results for display with additional data for visualization
      const formattedResults = {
        hypotheses: hypotheses.map((h: any) => ({
          id: h.rank,
          description: h.description,
          pTotal: parseFloat(h.p_total),
          gamma: parseFloat(h.gamma),
          resonancePoint: parseFloat(h.resonance_point),
          status: h.status
        })),
        recommendation: analysis.recommendation,
        stressTest: {
          gammaInv: analysis.stress_test_gamma_inv,
          status: analysis.stress_test_status
        },
        domains: analysis.domains,
        task: analysis.task,
        goal: analysis.goal
      };

      setResults(formattedResults);
      setActiveTab("new"); // Switch to results view
      toast.success("Анализ загружен из истории");
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error("Ошибка загрузки анализа");
    }
  };

  // Function to perform ГРА analysis and save to database
  const performAnalysis = async (data: AnalysisData) => {
    if (!user) {
      toast.error("You must be logged in to perform analysis");
      navigate("/auth");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock results (в реальной системе здесь будет ГРА алгоритм)
      const hypothesesData = [
        {
          description: `Оптимальное решение для "${data.task}" через интеграцию ${data.domains.slice(0, 2).join(" и ")}`,
          pTotal: 0.892456,
          gamma: 2.3456,
          resonancePoint: 1.2345,
          status: "optimal" as const,
          rank: 1
        },
        {
          description: `Альтернативный подход с акцентом на ${data.domains[0]} и минимальными ограничениями`,
          pTotal: 0.856123,
          gamma: 1.8901,
          resonancePoint: 1.1234,
          status: "optimal" as const,
          rank: 2
        },
        {
          description: `Комбинированная стратегия с учетом всех доменов: ${data.domains.join(", ")}`,
          pTotal: 0.834567,
          gamma: 1.5678,
          resonancePoint: 1.0987,
          status: "suboptimal" as const,
          rank: 3
        },
        {
          description: `Инновационный метод через резонансный анализ ${data.domains[data.domains.length - 1]}`,
          pTotal: 0.798234,
          gamma: 0.9876,
          resonancePoint: 0.9456,
          status: "suboptimal" as const,
          rank: 4
        },
        {
          description: `Консервативный подход с фокусом на безопасность и этические аспекты`,
          pTotal: 0.756789,
          gamma: 0.3456,
          resonancePoint: 0.8123,
          status: "rejected" as const,
          rank: 5
        }
      ];

      const recommendation = `На основе резонансного анализа рекомендуется гипотеза #1 с максимальным Γ=2.3456. Данное решение оптимально сочетает ${data.domains[0]} и ${data.domains[1] || data.domains[0]}, достигая цели: "${data.goal}". Решение проходит стресс-тест и показывает устойчивость к инверсии.`;
      
      const stressTest = {
        gammaInv: -2.3456,
        status: "Система устойчива"
      };

      // Save analysis to database with user_id
      const { data: analysisRecord, error: analysisError } = await supabase
        .from('analyses')
        .insert({
          task: data.task,
          domains: data.domains,
          goal: data.goal,
          constraints: data.constraints,
          recommendation: recommendation,
          stress_test_gamma_inv: stressTest.gammaInv,
          stress_test_status: stressTest.status,
          user_id: user.id
        })
        .select()
        .single();

      if (analysisError) {
        console.error('Error saving analysis:', analysisError);
        toast.error("Ошибка сохранения анализа");
        return;
      }

      // Save hypotheses to database with auto-generated tags and user_id
      const hypothesesWithTags = await Promise.all(
        hypothesesData.map(async (hyp) => {
          // Generate tags using database function
          const { data: tagsData } = await supabase.rpc('generate_hypothesis_tags', {
            domains: data.domains,
            status: hyp.status,
            gamma: hyp.gamma
          });

          return {
            analysis_id: analysisRecord.id,
            description: hyp.description,
            p_total: hyp.pTotal,
            gamma: hyp.gamma,
            resonance_point: hyp.resonancePoint,
            status: hyp.status,
            rank: hyp.rank,
            tags: tagsData || [],
            user_id: user.id
          };
        })
      );

      const { error: hypothesesError } = await supabase
        .from('hypotheses')
        .insert(hypothesesWithTags);

      if (hypothesesError) {
        console.error('Error saving hypotheses:', hypothesesError);
        toast.error("Ошибка сохранения гипотез");
        return;
      }

      // Set results for display with domains for visualization
      const mockResults = {
        hypotheses: hypothesesData.map((h, i) => ({ ...h, id: i + 1 })),
        recommendation,
        stressTest,
        domains: data.domains,
        task: data.task,
        goal: data.goal
      };

      setResults(mockResults);
      toast.success("Анализ завершен и сохранен в историю");
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.error("Ошибка при выполнении анализа");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return null; // Will redirect to auth
  }

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitBranch className="w-4 h-4" />
                <span className="font-mono">v1.0</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
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

          {/* Tabs for New Analysis and History */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="new">Новый анализ</TabsTrigger>
              <TabsTrigger value="history">История</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-8">
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
                    domains={results.domains}
                    task={results.task}
                    goal={results.goal}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <HistoryPanel onLoadAnalysis={loadAnalysis} />
            </TabsContent>
          </Tabs>
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
