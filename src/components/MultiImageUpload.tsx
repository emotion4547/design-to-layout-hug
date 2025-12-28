import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import { uploadImage } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  className?: string;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({ 
  value = [], 
  onChange, 
  folder = 'products',
  className,
  label = 'Изображения',
  maxImages = 10
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      toast({ 
        title: 'Достигнут лимит', 
        description: `Максимум ${maxImages} изображений`,
        variant: 'destructive' 
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Validate files
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: 'Неверный формат файла', 
          description: 'Пожалуйста, выберите только изображения',
          variant: 'destructive' 
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: 'Файл слишком большой', 
          description: 'Максимальный размер файла 5MB',
          variant: 'destructive' 
        });
        return;
      }
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        const url = await uploadImage(file, 'images', folder);
        uploadedUrls.push(url);
      }
      onChange([...value, ...uploadedUrls]);
      toast({ title: `Загружено ${uploadedUrls.length} изображений` });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Ошибка загрузки', 
        description: 'Не удалось загрузить изображения. Проверьте настройки Storage в Supabase.',
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newValue = [...value];
    const [draggedItem] = newValue.splice(draggedIndex, 1);
    newValue.splice(index, 0, draggedItem);
    onChange(newValue);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {value.length} / {maxImages}
        </span>
      </div>
      
      {/* Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div
              key={url + index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden bg-secondary group cursor-move",
                draggedIndex === index && "opacity-50",
                index === 0 && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <img 
                src={url} 
                alt={`Image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="absolute top-2 left-2 p-1 bg-background/80 rounded">
                  <GripVertical className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 bg-background/80 hover:bg-background rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                  Главное
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {value.length < maxImages && (
        <label className={cn(
          "flex flex-col items-center justify-center w-full border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30",
          value.length === 0 ? "aspect-video" : "py-6"
        )}>
          <div className="flex flex-col items-center justify-center py-4">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Нажмите или перетащите изображения
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP до 5MB
                </p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      )}

      <p className="text-xs text-muted-foreground">
        Перетаскивайте для изменения порядка. Первое изображение будет главным.
      </p>
    </div>
  );
}
