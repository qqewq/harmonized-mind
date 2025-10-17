import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

interface InputFormProps {
  onAnalyze: (data: {
    task: string;
    domains: string[];
    goal: string;
    constraints: string;
  }) => void;
  isLoading: boolean;
}

const DOMAINS = [
  "Медицина",
  "Физика",
  "Этика",
  "Математика",
  "Биология",
  "Химия",
  "Философия",
  "Инженерия"
];

// Zod validation schema for input validation
const analysisSchema = z.object({
  task: z.string()
    .min(1, { message: "Задача обязательна" })
    .transform(val => val.trim())
    .pipe(z.string()
      .min(10, { message: "Задача должна содержать минимум 10 символов" })
      .max(2000, { message: "Задача должна содержать максимум 2000 символов" })),
  domains: z.array(z.string())
    .min(1, { message: "Выберите хотя бы один домен" })
    .max(8, { message: "Максимум 8 доменов" }),
  goal: z.string()
    .min(1, { message: "Цель обязательна" })
    .transform(val => val.trim())
    .pipe(z.string()
      .min(5, { message: "Цель должна содержать минимум 5 символов" })
      .max(500, { message: "Цель должна содержать максимум 500 символов" })),
  constraints: z.string()
    .transform(val => val.trim())
    .pipe(z.string()
      .max(1000, { message: "Ограничения должны содержать максимум 1000 символов" }))
});

export const InputForm = ({ onAnalyze, isLoading }: InputFormProps) => {
  const [task, setTask] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [constraints, setConstraints] = useState("");

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = analysisSchema.parse({
        task,
        domains: selectedDomains,
        goal,
        constraints
      }) as {
        task: string;
        domains: string[];
        goal: string;
        constraints: string;
      };
      
      onAnalyze(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      }
    }
  };

  const isFormValid = task && selectedDomains.length > 0 && goal;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="task" className="text-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Описание задачи
        </Label>
        <Textarea
          id="task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Опишите задачу для анализа ГРА..."
          className="min-h-[120px] bg-input border-border focus:border-primary transition-colors"
          required
        />
      </div>

      <div className="space-y-3">
        <Label className="text-foreground">Выберите домены</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DOMAINS.map((domain) => (
            <div
              key={domain}
              className="flex items-center space-x-2 p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors"
            >
              <Checkbox
                id={domain}
                checked={selectedDomains.includes(domain)}
                onCheckedChange={() => handleDomainToggle(domain)}
              />
              <label
                htmlFor={domain}
                className="text-sm font-medium leading-none cursor-pointer select-none"
              >
                {domain}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal" className="text-foreground">
          Цель анализа
        </Label>
        <Input
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Укажите цель..."
          className="bg-input border-border focus:border-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="constraints" className="text-foreground">
          Ограничения (опционально)
        </Label>
        <Textarea
          id="constraints"
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder="Укажите ограничения..."
          className="min-h-[80px] bg-input border-border focus:border-primary transition-colors"
        />
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6 text-lg shadow-glow-primary"
      >
        {isLoading ? (
          <>
            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
            Анализ в процессе...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            Запустить анализ ГРА
          </>
        )}
      </Button>
    </form>
  );
};
