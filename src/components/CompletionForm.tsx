import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { DatePicker } from './ui/datepicker';

interface CompletionFormProps {
  title: string;
  subtitle: string;
  completedCount: number;
  totalCount: number;
  isLastCard: boolean;
  onSave: (data: { date: Date; comment: string; collectionComment: string }) => void;
}

const CompletionForm = ({ title, subtitle, completedCount, totalCount, isLastCard, onSave }: CompletionFormProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      onSave({ date, comment, collectionComment: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 animate-fade-in">
      <div className="text-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-2 sm:p-3 rounded-md">
        <p className="font-bold text-sm sm:text-base md:text-lg">Parabéns!</p>
        <p className="text-xs sm:text-sm">Você raspou a carta {completedCount}/{totalCount} da coleção.</p>
      </div>
      <div className="space-y-1 pt-2">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{subtitle}</p>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold">{title}</h3>
      </div>
      <div>
        <Label htmlFor="date" className="text-sm sm:text-base">Data de Conclusão</Label>
        <DatePicker date={date} setDate={setDate} />
      </div>
      <div>
        <Label htmlFor="comment" className="text-sm sm:text-base">Como foi sua experiência?</Label>
        <Textarea
          id="comment"
          placeholder="Como foi sua experiência?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="text-sm min-h-[80px]"
        />
        <p className="text-xs text-muted-foreground text-center pt-1">
          Sua experiência será exibida como descrição do post no feed.
        </p>
      </div>
      <Button type="submit" className="w-full text-sm sm:text-base h-11 sm:h-10">
        Salvar Progresso
      </Button>
    </form>
  );
};

export default CompletionForm;