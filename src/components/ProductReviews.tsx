import { reachGoal, GOALS } from '@/lib/metrika';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useProductReviews, useSubmitReview } from '@/hooks/useReviews';

/** Ряд звёзд. Для выбора оценки передаётся onPick. */
const Stars = ({
  value, size = 16, onPick,
}: { value: number; size?: number; onPick?: (v: number) => void }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => {
      const filled = i <= Math.round(value);
      const star = (
        <Star
          className={filled ? 'fill-primary text-primary' : 'text-muted-foreground/40'}
          style={{ width: size, height: size }}
        />
      );
      return onPick ? (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`Оценка ${i} из 5`}
          className="p-0.5 transition-transform hover:scale-110"
        >
          {star}
        </button>
      ) : (
        <span key={i}>{star}</span>
      );
    })}
  </span>
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const submit = useSubmitReview(productId);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const average =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Как вас зовут?', variant: 'destructive' });
      return;
    }
    try {
      await submit.mutateAsync({ productId, authorName: name, rating, text });
      reachGoal(GOALS.reviewSubmit, { product_id: productId, rating });
      setSent(true);
      setName(''); setText(''); setRating(5);
      // Отзыв не появится сразу — честно предупреждаем, иначе человек
      // решит, что форма не сработала.
      toast({
        title: 'Спасибо за отзыв',
        description: 'Он появится на странице после проверки.',
      });
    } catch {
      toast({ title: 'Не удалось отправить отзыв', variant: 'destructive' });
    }
  };

  return (
    <section className="mt-12 border-t border-border pt-8" id="reviews">
      <div className="flex items-baseline gap-3 flex-wrap mb-6">
        <h2 className="text-2xl font-bold">Отзывы</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Stars value={average} />
            <span className="font-medium text-foreground">{average.toFixed(1)}</span>
            <span>· {reviews.length}</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загружаем отзывы…</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground mb-8">
          Отзывов пока нет. Будьте первым — расскажите, как прошло вручение.
        </p>
      ) : (
        <ul className="space-y-6 mb-10">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-border/60 pb-5 last:border-0">
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <span className="font-semibold">{r.author_name}</span>
                <Stars value={r.rating} size={14} />
                <span className="text-sm text-muted-foreground">{formatDate(r.created_at)}</span>
              </div>
              {r.text && <p className="text-muted-foreground whitespace-pre-line">{r.text}</p>}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <h3 className="text-lg font-semibold">
          {sent ? 'Оставить ещё один отзыв' : 'Оставить отзыв'}
        </h3>

        <div className="space-y-1.5">
          <label htmlFor="review-name" className="text-sm font-medium">Как вас зовут</label>
          <Input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            maxLength={60}
            required
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium block">Оценка</span>
          <Stars value={rating} size={26} onPick={setRating} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="review-text" className="text-sm font-medium">Впечатление</label>
          <Textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Свежесть, оформление, доставка — что показалось важным"
            rows={4}
            maxLength={2000}
          />
        </div>

        <Button type="submit" disabled={submit.isPending}>
          {submit.isPending ? 'Отправляем…' : 'Отправить отзыв'}
        </Button>
      </form>
    </section>
  );
};
