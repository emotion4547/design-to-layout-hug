import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSetting, useUpdateSetting } from '@/hooks/useSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, ExternalLink, CheckCircle, XCircle, Loader2, RefreshCw, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface IntegrationLog {
  id: string;
  integration_type: string;
  order_id: string | null;
  status: string;
  message: string | null;
  response_data: Record<string, unknown> | null;
  created_at: string;
}

export default function AdminIntegrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Интеграции</h1>
        <p className="text-muted-foreground mt-2">
          Настройка внешних сервисов и просмотр логов
        </p>
      </div>

      <Tabs defaultValue="amocrm">
        <TabsList>
          <TabsTrigger value="amocrm">AmoCRM</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
          <TabsTrigger value="logs">Логи</TabsTrigger>
        </TabsList>

        <TabsContent value="amocrm" className="space-y-6 mt-6">
          <AmoCRMSettings />
        </TabsContent>

        <TabsContent value="telegram" className="space-y-6 mt-6">
          <TelegramSettings />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6 mt-6">
          <IntegrationLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AmoCRMSettings() {
  const { data: savedSubdomain, isLoading: loadingSubdomain } = useSetting('amocrm_subdomain');
  const { data: savedToken, isLoading: loadingToken } = useSetting('amocrm_access_token');
  const { data: savedEnabled, isLoading: loadingEnabled } = useSetting('amocrm_enabled');
  const updateSetting = useUpdateSetting();

  const [subdomain, setSubdomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (savedSubdomain) setSubdomain(savedSubdomain);
  }, [savedSubdomain]);

  useEffect(() => {
    if (savedToken) setAccessToken(savedToken);
  }, [savedToken]);

  useEffect(() => {
    if (savedEnabled) setEnabled(savedEnabled === 'true');
  }, [savedEnabled]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'amocrm_subdomain', value: subdomain }),
        updateSetting.mutateAsync({ key: 'amocrm_access_token', value: accessToken }),
        updateSetting.mutateAsync({ key: 'amocrm_enabled', value: enabled ? 'true' : 'false' }),
      ]);
      toast.success('Настройки AmoCRM сохранены');
    } catch (error) {
      toast.error('Ошибка сохранения настроек');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!subdomain || !accessToken) {
      toast.error('Заполните субдомен и токен доступа');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(`https://${subdomain}.amocrm.ru/api/v4/account`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTestResult('success');
        toast.success(`Подключено: ${data.name}`);
      } else {
        setTestResult('error');
        toast.error('Ошибка подключения');
      }
    } catch {
      setTestResult('error');
      toast.error('Ошибка подключения');
    } finally {
      setIsTesting(false);
    }
  };

  const isLoading = loadingSubdomain || loadingToken || loadingEnabled;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Настройки AmoCRM</CardTitle>
          <CardDescription>Автоматическая отправка заказов в CRM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Интеграция активна</Label>
              <p className="text-sm text-muted-foreground">Отправлять заказы в AmoCRM</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label>Субдомен AmoCRM</Label>
            <div className="flex items-center gap-2">
              <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="mycompany" disabled={isLoading} />
              <span className="text-muted-foreground">.amocrm.ru</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Токен доступа</Label>
            <Input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="Вставьте токен" disabled={isLoading} />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Сохранить
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={isTesting || !subdomain || !accessToken}>
              {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : testResult === 'success' ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : testResult === 'error' ? <XCircle className="h-4 w-4 mr-2 text-red-500" /> : null}
              Проверить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Инструкция</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Войдите в AmoCRM → Настройки → Интеграции</li>
            <li>Создайте внешнюю интеграцию</li>
            <li>Скопируйте долгоживущий токен из раздела "Ключи и доступы"</li>
          </ol>
          <Button variant="link" className="p-0 h-auto mt-4" asChild>
            <a href="https://www.amocrm.ru/developers/content/oauth/step-by-step" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />Документация
            </a>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function TelegramSettings() {
  const { data: savedToken } = useSetting('telegram_bot_token');
  const { data: savedChatId } = useSetting('telegram_chat_id');
  const { data: savedEnabled } = useSetting('telegram_enabled');
  const updateSetting = useUpdateSetting();

  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => { if (savedToken) setBotToken(savedToken); }, [savedToken]);
  useEffect(() => { if (savedChatId) setChatId(savedChatId); }, [savedChatId]);
  useEffect(() => { if (savedEnabled) setEnabled(savedEnabled === 'true'); }, [savedEnabled]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: 'telegram_bot_token', value: botToken }),
        updateSetting.mutateAsync({ key: 'telegram_chat_id', value: chatId }),
        updateSetting.mutateAsync({ key: 'telegram_enabled', value: enabled ? 'true' : 'false' }),
      ]);
      toast.success('Настройки Telegram сохранены');
    } catch {
      toast.error('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!botToken || !chatId) {
      toast.error('Заполните токен бота и Chat ID');
      return;
    }
    setIsTesting(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: '✅ Тестовое сообщение от магазина цветов!' }),
      });
      const result = await response.json();
      if (result.ok) {
        toast.success('Сообщение отправлено!');
      } else {
        toast.error(`Ошибка: ${result.description}`);
      }
    } catch {
      toast.error('Ошибка отправки');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Настройки Telegram</CardTitle>
          <CardDescription>Уведомления о новых заказах</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Уведомления активны</Label>
              <p className="text-sm text-muted-foreground">Отправлять уведомления в Telegram</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2">
            <Label>Токен бота</Label>
            <Input type="password" value={botToken} onChange={(e) => setBotToken(e.target.value)} placeholder="123456:ABC-DEF..." />
            <p className="text-sm text-muted-foreground">Получите у @BotFather</p>
          </div>

          <div className="space-y-2">
            <Label>Chat ID</Label>
            <Input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-1001234567890" />
            <p className="text-sm text-muted-foreground">ID чата или группы для уведомлений</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Сохранить
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={isTesting || !botToken || !chatId}>
              {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Тест
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Как настроить</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Создайте бота через @BotFather в Telegram</li>
            <li>Скопируйте токен бота</li>
            <li>Добавьте бота в группу или чат</li>
            <li>Узнайте Chat ID через @userinfobot или @getidsbot</li>
          </ol>
        </CardContent>
      </Card>
    </>
  );
}

function IntegrationLogs() {
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['integration-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as IntegrationLog[];
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500">Успешно</Badge>;
      case 'error': return <Badge variant="destructive">Ошибка</Badge>;
      case 'skipped': return <Badge variant="secondary">Пропущено</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Логи интеграций</CardTitle>
          <CardDescription>Последние 50 записей</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !logs?.length ? (
          <p className="text-center py-8 text-muted-foreground">Нет записей</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Сообщение</TableHead>
                <TableHead>Заказ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.integration_type}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.order_id?.slice(0, 8) || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
