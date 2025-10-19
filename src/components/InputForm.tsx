import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { translations } from "@/lib/translations";
import type { Language } from "@/hooks/useLanguage";

interface InputFormProps {
  onAnalyze: (prompt: string) => void;
  isLoading: boolean;
  language: Language;
}

// Zod validation schema for input validation
const promptSchema = z.string()
  .min(1, { message: "Запрос обязателен / Prompt required" })
  .transform(val => val.trim())
  .pipe(z.string()
    .min(10, { message: "Минимум 10 символов / Minimum 10 characters" })
    .max(2000, { message: "Максимум 2000 символов / Maximum 2000 characters" }));

export const InputForm = ({ onAnalyze, isLoading, language }: InputFormProps) => {
  const t = translations[language];
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
          {t.inputLabel}
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.inputPlaceholder}
          className="min-h-[160px] bg-input border-border focus:border-primary transition-colors text-base"
          required
        />
        <p className="text-sm text-muted-foreground">
          {language === 'ru' 
            ? 'Опишите задачу для гибридного резонансного алгоритма' 
            : 'Describe the task for the hybrid resonance algorithm'}
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
            {language === 'ru' ? 'Анализ в процессе...' : 'Analysis in progress...'}
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            {t.submitButton}
          </>
        )}
      </Button>
    </form>
  );
};
