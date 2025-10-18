import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

interface InputFormProps {
  onAnalyze: (prompt: string) => void;
  isLoading: boolean;
}

// Zod validation schema for input validation
const promptSchema = z.string()
  .min(1, { message: "Запрос обязателен" })
  .transform(val => val.trim())
  .pipe(z.string()
    .min(10, { message: "Запрос должен содержать минимум 10 символов" })
    .max(2000, { message: "Запрос должен содержать максимум 2000 символов" }));

export const InputForm = ({ onAnalyze, isLoading }: InputFormProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedPrompt = promptSchema.parse(prompt);
      onAnalyze(validatedPrompt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Ваш запрос
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Например: "найди сверхпроводник при 20°C" или "как обеспечить безопасный доступ к аборции на Северном Кавказе?"'
          className="min-h-[160px] bg-input border-border focus:border-primary transition-colors text-base"
          required
        />
        <p className="text-sm text-muted-foreground">
          Опишите задачу для гибридного резонансного алгоритма
        </p>
      </div>

      <Button
        type="submit"
        disabled={!prompt.trim() || isLoading}
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
            Запустить ГРА
          </>
        )}
      </Button>
    </form>
  );
};
