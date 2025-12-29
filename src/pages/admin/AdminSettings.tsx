import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useSetting, useUpdateSetting } from '@/hooks/useSettings';

interface SettingFieldProps {
  label: string;
  settingKey: string;
  placeholder: string;
  icon?: React.ReactNode;
}

const SettingField = ({ label, settingKey, placeholder, icon }: SettingFieldProps) => {
  const { data: value, isLoading } = useSetting(settingKey);
  const updateSetting = useUpdateSetting();
  const [inputValue, setInputValue] = useState('');
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== null && !isEdited) {
      setInputValue(value);
    }
  }, [value, isEdited]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: settingKey, value: inputValue });
      setIsEdited(false);
      toast.success(`${label} сохранён`);
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsEdited(true);
          }}
          placeholder={placeholder}
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSave} 
          disabled={!isEdited || updateSetting.isPending}
          size="sm"
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Настройки сайта</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Контактная информация
            </CardTitle>
            <CardDescription>
              Телефон и адрес, отображаемые на сайте
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingField
              label="Телефон"
              settingKey="phone"
              placeholder="+7 (999) 123-45-67"
              icon={<Phone className="h-4 w-4" />}
            />
            <SettingField
              label="Адрес"
              settingKey="address"
              placeholder="г. Новороссийск, ул. Примерная, 1"
              icon={<MapPin className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        {/* Social Networks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Социальные сети
            </CardTitle>
            <CardDescription>
              Ссылки на социальные сети и мессенджеры
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingField
              label="ВКонтакте"
              settingKey="vk_url"
              placeholder="https://vk.com/your_page"
            />
            <SettingField
              label="Telegram"
              settingKey="telegram_url"
              placeholder="https://t.me/your_channel"
            />
            <SettingField
              label="WhatsApp"
              settingKey="whatsapp_url"
              placeholder="https://wa.me/79991234567"
            />
            <SettingField
              label="Instagram"
              settingKey="instagram_url"
              placeholder="https://instagram.com/your_page"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
