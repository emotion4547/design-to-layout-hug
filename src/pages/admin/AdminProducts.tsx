import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, Search, Download, Upload, FileCode2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { useCategories } from '@/hooks/useCategories';
import {
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  Product,
  ProductInsert,
} from '@/services/products';
import { supabase } from '@/integrations/supabase/client';

const AdminProducts = () => {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<ProductInsert> & { images?: string[]; category_id?: string }>({
    name: '',
    description: '',
    price: 0,
    old_price: null,
    image_url: '',
    images: [],
    category_id: '',
    article: '',
    size: '',
    in_stock: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: getAllProducts,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast({ title: 'Товар создан' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Ошибка создания товара', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductInsert> }) => 
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast({ title: 'Товар обновлён' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Ошибка обновления товара', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast({ title: 'Товар удалён' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления товара', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      old_price: null,
      image_url: '',
      images: [],
      category_id: categories?.[0]?.id || '',
      article: '',
      size: '',
      in_stock: true,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      old_price: product.old_price,
      image_url: product.image_url,
      images: product.images || [],
      category_id: (product as any).category_id || '',
      article: product.article || '',
      size: product.size || '',
      in_stock: product.in_stock,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({ title: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }

    // Set first gallery image as main image_url if not set
    const dataToSave = {
      ...formData,
      image_url: formData.image_url || (formData.images && formData.images[0]) || '',
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave as ProductInsert);
    }
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  // Export products to Excel
  const handleExport = () => {
    if (!products || products.length === 0) {
      toast({ title: 'Нет товаров для экспорта', variant: 'destructive' });
      return;
    }

    const exportData = products.map((product) => ({
      'ID': product.id,
      'Название': product.name,
      'Описание': product.description || '',
      'Цена': product.price,
      'Старая цена': product.old_price || '',
      'Категория': categories?.find(c => c.id === (product as any).category_id)?.name || '',
      'ID категории': (product as any).category_id || '',
      'Артикул': product.article || '',
      'Размер': product.size || '',
      'В наличии': product.in_stock ? 'Да' : 'Нет',
      'Изображение': product.image_url || '',
      'Галерея': product.images?.join(', ') || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row] || '').length)))
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: `Экспортировано ${products.length} товаров` });
  };

  // Import products from Excel
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

      if (jsonData.length === 0) {
        toast({ title: 'Файл пустой', variant: 'destructive' });
        setIsImporting(false);
        return;
      }

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const row of jsonData) {
        const productData: Partial<ProductInsert> & { category_id?: string } = {
          name: String(row['Название'] || '').trim(),
          description: String(row['Описание'] || '').trim() || null,
          price: Number(row['Цена']) || 0,
          old_price: row['Старая цена'] ? Number(row['Старая цена']) : null,
          category_id: row['ID категории'] || categories?.find(c => c.name === row['Категория'])?.id || undefined,
          article: String(row['Артикул'] || '').trim() || null,
          size: String(row['Размер'] || '').trim() || null,
          in_stock: row['В наличии'] === 'Да' || row['В наличии'] === true || row['В наличии'] === 'true',
          image_url: String(row['Изображение'] || '').trim() || '',
          images: row['Галерея'] ? String(row['Галерея']).split(',').map(s => s.trim()).filter(Boolean) : [],
        };

        if (!productData.name || !productData.price) {
          errors++;
          continue;
        }

        const existingId = row['ID'];

        try {
          if (existingId && products?.some(p => p.id === existingId)) {
            // Update existing product
            const { error } = await supabase
              .from('products')
              .update({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                old_price: productData.old_price,
                category_id: productData.category_id,
                article: productData.article,
                size: productData.size,
                in_stock: productData.in_stock,
                image_url: productData.image_url,
                images: productData.images,
              })
              .eq('id', existingId);
            
            if (error) throw error;
            updated++;
          } else {
            // Create new product
            const { error } = await supabase
              .from('products')
              .insert({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                old_price: productData.old_price,
                category_id: productData.category_id,
                article: productData.article,
                size: productData.size,
                in_stock: productData.in_stock ?? true,
                image_url: productData.image_url || '/placeholder.svg',
                images: productData.images,
              });
            
            if (error) throw error;
            created++;
          }
        } catch (err) {
          console.error('Error importing product:', err);
          errors++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      
      toast({ 
        title: 'Импорт завершён',
        description: `Создано: ${created}, обновлено: ${updated}, ошибок: ${errors}`,
      });
    } catch (err) {
      console.error('Import error:', err);
      toast({ title: 'Ошибка импорта файла', variant: 'destructive' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Товары</h1>
          <p className="text-muted-foreground">Управление каталогом товаров</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Button */}
          <Button variant="outline" onClick={handleExport} disabled={!products?.length}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт Excel
          </Button>

          {/* YML feed for Yandex.Direct */}
          <Button
            variant="outline"
            onClick={() => {
              const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yandex-yml?download=1`;
              window.open(url, '_blank');
            }}
          >
            <FileCode2 className="h-4 w-4 mr-2" />
            Скачать YML (Яндекс)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yandex-yml`;
              navigator.clipboard.writeText(url);
              toast({ title: 'Ссылка на YML скопирована', description: url });
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Ссылка на фид
          </Button>

          {/* Import Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Импорт Excel
          </Button>

          {/* Add Product Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить товар
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Редактировать товар' : 'Новый товар'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Цена *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="old_price">Старая цена</Label>
                  <Input
                    id="old_price"
                    type="number"
                    value={formData.old_price || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      old_price: e.target.value ? Number(e.target.value) : null 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="article">Артикул</Label>
                  <Input
                    id="article"
                    value={formData.article || ''}
                    onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="size">Размер</Label>
                  <Input
                    id="size"
                    value={formData.size || ''}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="20-25см"
                  />
                </div>
                <div className="col-span-2">
                  <MultiImageUpload
                    value={formData.images || []}
                    onChange={(urls) => setFormData({ 
                      ...formData, 
                      images: urls,
                      image_url: urls[0] || formData.image_url || ''
                    })}
                    folder="products"
                    label="Галерея изображений"
                    maxImages={8}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                  <Label htmlFor="in_stock">В наличии</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingProduct ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск товаров..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Товары не найдены
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[100px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {categories?.find(c => c.id === (product as any).category_id)?.name || product.category || '—'}
                    </TableCell>
                    <TableCell>{formatPrice(product.price)} ₽</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.in_stock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Удалить товар?')) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
