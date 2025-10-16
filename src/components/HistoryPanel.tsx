import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, Search, TrendingUp, Calendar, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Analysis {
  id: string;
  task: string;
  domains: string[];
  goal: string;
  created_at: string;
  recommendation: string;
}

interface HistoryPanelProps {
  onLoadAnalysis?: (analysisId: string) => void;
}

export const HistoryPanel = ({ onLoadAnalysis }: HistoryPanelProps) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterAnalyses();
  }, [searchQuery, selectedDomain, analyses]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error("Ошибка загрузки истории");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAnalyses = () => {
    let filtered = [...analyses];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.goal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by domain
    if (selectedDomain) {
      filtered = filtered.filter(a => a.domains.includes(selectedDomain));
    }

    setFilteredAnalyses(filtered);
  };

  const allDomains = Array.from(
    new Set(analyses.flatMap(a => a.domains))
  ).sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <History className="w-6 h-6 text-primary animate-pulse-glow" />
          История анализов
        </h2>
        <Badge variant="outline" className="text-primary border-primary">
          {filteredAnalyses.length} записей
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 bg-card border-border">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по задаче или цели..."
              className="pl-10 bg-input border-border"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Button
              variant={selectedDomain === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDomain(null)}
            >
              Все домены
            </Button>
            {allDomains.map((domain) => (
              <Button
                key={domain}
                variant={selectedDomain === domain ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDomain(domain)}
              >
                {domain}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-6 bg-card border-border">
            <div className="text-center text-muted-foreground">
              Загрузка истории...
            </div>
          </Card>
        ) : filteredAnalyses.length === 0 ? (
          <Card className="p-6 bg-card border-border">
            <div className="text-center text-muted-foreground">
              {analyses.length === 0
                ? "История пуста. Выполните первый анализ!"
                : "Ничего не найдено по заданным фильтрам"}
            </div>
          </Card>
        ) : (
          filteredAnalyses.map((analysis) => (
            <Card
              key={analysis.id}
              className="p-6 bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow-primary cursor-pointer"
              onClick={() => onLoadAnalysis?.(analysis.id)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-2">
                      {analysis.task}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-semibold">Цель:</span> {analysis.goal}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(analysis.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {analysis.domains.map((domain) => (
                    <Badge
                      key={domain}
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/30"
                    >
                      {domain}
                    </Badge>
                  ))}
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground line-clamp-2">
                      {analysis.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
