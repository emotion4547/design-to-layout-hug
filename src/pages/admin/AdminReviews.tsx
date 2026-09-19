import { Star, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAllReviews, useModerateReview, useDeleteReview } from '@/hooks/useReviews';

const Stars = ({ value }: { value: number }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i <= value ? 'fill-primary text-primary' : 'text-muted-foreground/40'}`}
      />
    ))}
  </span>
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const AdminReviews = () => {
  const { data: reviews = [], isLoading } = useAllReviews();
  const moderate = useModerateReview();
  const remove = useDeleteReview();
  const { toast } = useToast();

  // Непроверенные показываем первыми: ради них сюда и заходят.
  const pending = reviews.filter((r) => !r.is_published);
  const published = reviews.filter((r) => r.is_published);

  const handle = async (fn: Promise<unknown>, ok: string) => {
    try {
      await fn;
      toast({ title: ok });
    } catch {
      toast({ title: 'Не получилось', variant: 'destructive' });
    }
  };

  const Row = ({ r }: { r: (typeof reviews)[number] }) => (
    <li className="border border-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold">{r.author_name}</span>
            <Stars value={r.rating} />
            <span className="text-sm text-muted-foreground">{formatDate(r.created_at)}</span>
          </div>
          {r.text && <p className="text-muted-foreground whitespace-pre-line">{r.text}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          {r.is_published ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handle(moderate.mutateAsync({ id: r.id, published: false }), 'Снят с публикации')}
            >
              <X className="h-4 w-4 mr-1.5" />
              Снять
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handle(moderate.mutateAsync({ id: r.id, published: true }), 'Опубликован')}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Опубликовать
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Удалить отзыв? Отменить будет нельзя.')) {
                handle(remove.mutateAsync(r.id), 'Удалён');
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Отзывы</h1>
        <p className="text-muted-foreground">
          Новые отзывы не показываются на сайте, пока вы их не проверите.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загружаем…</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              Ждут проверки {pending.length > 0 && <span className="text-primary">({pending.length})</span>}
            </h2>
            {pending.length === 0 ? (
              <p className="text-muted-foreground">Новых отзывов нет.</p>
            ) : (
              <ul className="space-y-3">{pending.map((r) => <Row key={r.id} r={r} />)}</ul>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">На сайте ({published.length})</h2>
            {published.length === 0 ? (
              <p className="text-muted-foreground">Опубликованных отзывов пока нет.</p>
            ) : (
              <ul className="space-y-3">{published.map((r) => <Row key={r.id} r={r} />)}</ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminReviews;
