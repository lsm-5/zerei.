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
  const [collectionComment, setCollectionComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      onSave({ date, comment, collectionComment });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="text-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-3 rounded-md">
        <p className="font-bold text-lg">Parabéns!</p>
        <p className="text-sm">Você raspou a carta {completedCount}/{totalCount} da coleção.</p>
      </div>
      <div className="space-y-1 pt-2">
        <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <div>
        <Label htmlFor="date">Data de Conclusão</Label>
        <DatePicker date={date} setDate={setDate} />
      </div>
      <div>
        <Label htmlFor="comment">Comentário do Card (opcional)</Label>
        <Textarea
          id="comment"
          placeholder="O que você achou desta experiência?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground text-center pt-1">
          Seu comentário poderá aparecer no feed de atividades.
        </p>
      </div>
      {isLastCard && (
        <div className="animate-fade-in border-t pt-4">
          <Label htmlFor="collection-comment" className="text-base font-semibold">Avaliação da Coleção</Label>
          <Textarea
            id="collection-comment"
            placeholder="Como foi sua experiência ao completar esta coleção?"
            value={collectionComment}
            onChange={(e) => setCollectionComment(e.target.value)}
            rows={3}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground text-center pt-1">
            Sua avaliação aparecerá no feed e na página da coleção.
          </p>
        </div>
      )}
      <Button type="submit" className="w-full">
        Salvar Progresso
      </Button>
    </form>
  );
};

export default CompletionForm;