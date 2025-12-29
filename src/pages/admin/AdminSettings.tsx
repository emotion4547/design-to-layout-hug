import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Phone, MapPin, MessageCircle, Snowflake, PartyPopper, Sparkles, Image as ImageIcon} from 'lucide-react';
import { useSetting, useUpdateSetting } from '@/hooks/useSettings';
import { ImageUpload } from '@/components/ImageUpload';

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

interface ToggleSettingProps {
  label: string;
  description: string;
  settingKey: string;
  icon?: React.ReactNode;
}

const ToggleSetting = ({ label, description, settingKey, icon }: ToggleSettingProps) => {
  const { data: value, isLoading } = useSetting(settingKey);
  const updateSetting = useUpdateSetting();
  const isEnabled = value === 'true';

  const handleToggle = async (checked: boolean) => {
    try {
      await updateSetting.mutateAsync({ key: settingKey, value: checked ? 'true' : 'false' });
      toast.success(checked ? `${label} включено` : `${label} выключено`);
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isLoading || updateSetting.isPending}
      />
    </div>
  );
};

interface ImageSettingProps {
  label: string;
  description: string;
  settingKey: string;
}

const ImageSetting = ({ label, description, settingKey }: ImageSettingProps) => {
  const { data: value, isLoading } = useSetting(settingKey);
  const updateSetting = useUpdateSetting();

  const handleChange = async (url: string) => {
    try {
      await updateSetting.mutateAsync({ key: settingKey, value: url });
      toast.success(`${label} обновлено`);
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ImageUpload
        value={value || ''}
        onChange={handleChange}
      />
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

        {/* Hero Image */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Главный баннер
            </CardTitle>
            <CardDescription>
              Фоновое изображение Hero-блока на главной странице
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageSetting
              label="Изображение Hero-блока"
              description="Рекомендуемый размер: 1920x800 пикселей. Оставьте пустым для использования изображения по умолчанию."
              settingKey="hero_image_url"
            />
          </CardContent>
        </Card>

        {/* Visual Effects */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Визуальные эффекты
            </CardTitle>
            <CardDescription>
              Праздничные эффекты и анимации на сайте
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ToggleSetting
              label="Анимация снега"
              description="Падающие снежинки в Hero-блоке"
              settingKey="snow_enabled"
              icon={<Snowflake className="h-5 w-5 text-blue-400" />}
            />
            <ToggleSetting
              label="Конфетти"
              description="Падающее разноцветное конфетти"
              settingKey="confetti_enabled"
              icon={<PartyPopper className="h-5 w-5 text-pink-400" />}
            />
            <ToggleSetting
              label="Фейерверк"
              description="Анимированные вспышки фейерверка"
              settingKey="fireworks_enabled"
              icon={<Sparkles className="h-5 w-5 text-yellow-400" />}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
