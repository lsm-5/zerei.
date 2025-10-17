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
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 animate-fade-in">
      <div className="text-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-2 md:p-3 rounded-md">
        <p className="font-bold text-base md:text-lg">Parabéns!</p>
        <p className="text-xs md:text-sm">Você raspou a carta {completedCount}/{totalCount} da coleção.</p>
      </div>
      <div className="space-y-1 pt-2">
        <p className="text-xs md:text-sm font-medium text-muted-foreground">{subtitle}</p>
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
      </div>
      <div>
        <Label htmlFor="date">Data de Conclusão</Label>
        <DatePicker date={date} setDate={setDate} />
      </div>
      <div>
        <Label htmlFor="comment">Como foi sua experiência?</Label>
        <Textarea
          id="comment"
          placeholder="Como foi sua experiência?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground text-center pt-1">
          Sua experiência será exibida como descrição do post no feed.
        </p>
      </div>
      <Button type="submit" className="w-full text-sm md:text-base">
        Salvar Progresso
      </Button>
    </form>
  );
};

export default CompletionForm;