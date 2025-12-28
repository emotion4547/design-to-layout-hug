import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Send } from 'lucide-react';

interface TestMessage {
  id: string;
  message: string;
  created_at: string;
}

export function ConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('loading');
      const { data, error } = await supabase
        .from('connection_test')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setMessages(data || []);
      setStatus('connected');
      toast({
        title: 'Подключение успешно!',
        description: 'Связь с Supabase установлена',
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      setStatus('error');
      toast({
        title: 'Ошибка подключения',
        description: error.message || 'Не удалось подключиться к Supabase',
        variant: 'destructive',
      });
    }
  };

  const sendTestMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const { data, error } = await supabase
        .from('connection_test')
        .insert({ message: newMessage.trim() })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [data, ...prev]);
      setNewMessage('');
      toast({
        title: 'Сообщение отправлено!',
        description: 'Запись успешно добавлена в базу данных',
      });
    } catch (error: any) {
      console.error('Insert error:', error);
      toast({
        title: 'Ошибка отправки',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Тест подключения Supabase
          {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          {status === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
        </CardTitle>
        <CardDescription>
          {status === 'loading' && 'Проверка подключения...'}
          {status === 'connected' && 'Подключение установлено'}
          {status === 'error' && 'Ошибка подключения'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Введите тестовое сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendTestMessage()}
            disabled={status !== 'connected'}
          />
          <Button 
            onClick={sendTestMessage} 
            disabled={status !== 'connected' || sending || !newMessage.trim()}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {messages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Последние сообщения:</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className="text-sm p-2 bg-muted rounded-md">
                  <span>{msg.message}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" onClick={checkConnection} className="w-full">
          Проверить подключение заново
        </Button>
      </CardContent>
    </Card>
  );
}
