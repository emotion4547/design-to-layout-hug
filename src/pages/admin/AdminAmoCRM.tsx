import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSetting, useUpdateSetting } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { Save, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AdminAmoCRM() {
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
      console.error('Error saving AmoCRM settings:', error);
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
      // Test by getting account info
      const response = await fetch(`https://${subdomain}.amocrm.ru/api/v4/account`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult('success');
        toast.success(`Подключение успешно! Аккаунт: ${data.name}`);
      } else {
        setTestResult('error');
        toast.error('Ошибка подключения. Проверьте данные.');
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setTestResult('error');
      toast.error('Ошибка подключения к AmoCRM');
    } finally {
      setIsTesting(false);
    }
  };

  const isLoading = loadingSubdomain || loadingToken || loadingEnabled;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Интеграция AmoCRM</h1>
        <p className="text-muted-foreground mt-2">
          Настройте интеграцию для автоматической отправки заявок в AmoCRM
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Настройки подключения</CardTitle>
          <CardDescription>
            Введите данные для подключения к вашему аккаунту AmoCRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Интеграция активна</Label>
              <p className="text-sm text-muted-foreground">
                Включите для автоматической отправки заявок
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Субдомен AmoCRM</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                placeholder="mycompany"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                disabled={isLoading}
              />
              <span className="text-muted-foreground whitespace-nowrap">.amocrm.ru</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Например, если ваш адрес mycompany.amocrm.ru, введите "mycompany"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Долгоживущий токен доступа</Label>
            <Input
              id="token"
              type="password"
              placeholder="Вставьте токен доступа"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Получите токен в настройках AmoCRM: Настройки → Интеграции → Создать интеграцию
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTest}
              disabled={isTesting || !subdomain || !accessToken}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : testResult === 'success' ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : testResult === 'error' ? (
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
              ) : null}
              Проверить подключение
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Инструкция по настройке</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              Войдите в ваш аккаунт AmoCRM и перейдите в{' '}
              <strong>Настройки → Интеграции</strong>
            </li>
            <li>
              Нажмите <strong>"Создать интеграцию"</strong>
            </li>
            <li>
              Выберите тип <strong>"Внешняя интеграция"</strong>
            </li>
            <li>
              Укажите название интеграции (например, "Сайт")
            </li>
            <li>
              После создания перейдите в настройки интеграции и найдите раздел{' '}
              <strong>"Ключи и доступы"</strong>
            </li>
            <li>
              Скопируйте <strong>долгоживущий токен</strong> и вставьте его выше
            </li>
          </ol>
          
          <Button variant="link" className="p-0 h-auto" asChild>
            <a 
              href="https://www.amocrm.ru/developers/content/oauth/step-by-step" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Документация AmoCRM
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Что отправляется в AmoCRM</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            При создании заказа автоматически создаётся сделка с контактом:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Название сделки с номером заказа</li>
            <li>Сумма заказа</li>
            <li>Контакт клиента (имя, телефон, email)</li>
            <li>Примечание с полной информацией о заказе</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
