import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { useSetting, useUpdateSetting } from '@/hooks/useSettings';
import { ColorPicker } from '@/components/ColorPicker';

interface ColorSettingProps {
  label: string;
  description: string;
  settingKey: string;
  defaultValue: string;
}

const ColorSetting = ({ label, description, settingKey, defaultValue }: ColorSettingProps) => {
  const { data: savedValue, isLoading } = useSetting(settingKey);
  const updateSetting = useUpdateSetting();
  const [colorValue, setColorValue] = useState(defaultValue);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (savedValue !== undefined && savedValue !== null) {
      setColorValue(savedValue);
    }
  }, [savedValue]);

  const handleColorChange = (color: string) => {
    setColorValue(color);
    setIsEdited(true);
    
    // Apply preview immediately
    const root = document.documentElement;
    if (settingKey === 'primary_color') {
      root.style.setProperty('--primary', color);
      root.style.setProperty('--sidebar-primary', color);
    } else if (settingKey === 'accent_color') {
      root.style.setProperty('--accent', color);
      root.style.setProperty('--sidebar-accent', color);
    }
  };

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: settingKey, value: colorValue });
      setIsEdited(false);
      toast.success(`${label} сохранён`);
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  const handleReset = () => {
    setColorValue(defaultValue);
    setIsEdited(true);
    
    // Apply preview immediately
    const root = document.documentElement;
    if (settingKey === 'primary_color') {
      root.style.setProperty('--primary', defaultValue);
      root.style.setProperty('--sidebar-primary', defaultValue);
    } else if (settingKey === 'accent_color') {
      root.style.setProperty('--accent', defaultValue);
      root.style.setProperty('--sidebar-accent', defaultValue);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
        <div className="h-40 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-lg">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <ColorPicker
        value={colorValue}
        onChange={handleColorChange}
      />
      
      <div className="flex gap-2">
        <Button 
          onClick={handleSave} 
          disabled={!isEdited || updateSetting.isPending}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Сохранить
        </Button>
        <Button 
          variant="outline"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Сбросить
        </Button>
      </div>
    </div>
  );
};

const AdminDesign = () => {
  // Default values from index.css
  const defaultPrimary = "275 76% 53%"; // #8a2be2 blue-violet
  const defaultAccent = "210 40% 96%"; // light accent

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Дизайн</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Color */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Основной цвет (Primary)
            </CardTitle>
            <CardDescription>
              Главный цвет бренда: кнопки, ссылки, активные элементы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ColorSetting
              label="Primary цвет"
              description="Используется для кнопок, ссылок и акцентов"
              settingKey="primary_color"
              defaultValue={defaultPrimary}
            />
          </CardContent>
        </Card>

        {/* Accent Color */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Акцентный цвет (Accent)
            </CardTitle>
            <CardDescription>
              Дополнительный цвет для фонов и подсветки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ColorSetting
              label="Accent цвет"
              description="Используется для фонов карточек и подсветки"
              settingKey="accent_color"
              defaultValue={defaultAccent}
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Предпросмотр</CardTitle>
          <CardDescription>
            Как выглядят элементы с текущими цветами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button>Primary кнопка</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <div className="px-4 py-2 bg-accent text-accent-foreground rounded-lg">
              Accent фон
            </div>
            <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Primary фон
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDesign;
