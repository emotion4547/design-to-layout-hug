import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  label?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  folder = 'products',
  className,
  label = 'Изображение'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: 'Неверный формат файла', 
        description: 'Пожалуйста, выберите изображение',
        variant: 'destructive' 
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: 'Файл слишком большой', 
        description: 'Максимальный размер файла 5MB',
        variant: 'destructive' 
      });
      return;
    }

    // Show preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setIsUploading(true);
    try {
      const url = await uploadImage(file, 'images', folder);
      onChange(url);
      setPreviewUrl(url);
      toast({ title: 'Изображение загружено' });
    } catch (error) {
      console.error('Upload error:', error);
      setPreviewUrl(value);
      toast({ 
        title: 'Ошибка загрузки', 
        description: 'Не удалось загрузить изображение. Проверьте настройки Storage в Supabase.',
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
      // Clean up local preview
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreviewUrl('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      
      <div className="flex flex-col gap-3">
        {/* Preview */}
        {previewUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload area */}
        {!previewUrl && (
          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
            <div className="flex flex-col items-center justify-center py-6">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Нажмите для загрузки
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP до 5MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}

        {/* Upload button for existing images */}
        {previewUrl && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Заменить
                </>
              )}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        )}

        {/* Manual URL input */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">или</span>
          <Input
            placeholder="URL изображения"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreviewUrl(e.target.value);
            }}
            className="flex-1 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
