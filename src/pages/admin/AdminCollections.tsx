import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Image as ImageIcon, Package, Save } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useCollectionProducts,
  useAddProductToCollection,
  useRemoveProductFromCollection,
} from '@/hooks/useCollections';
import { useProducts } from '@/hooks/useProducts';
import { Collection } from '@/services/collections';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useSetting, useUpdateSetting } from '@/hooks/useSettings';

const AdminCollections = () => {
  const { data: collections, isLoading } = useCollections(false);
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  
  const { data: collectionsTitle } = useSetting('collections_title');
  const updateSetting = useUpdateSetting();
  const [titleInput, setTitleInput] = useState('');
  const [titleEdited, setTitleEdited] = useState(false);

  // Sync titleInput with fetched value
  if (collectionsTitle && !titleEdited && titleInput !== collectionsTitle) {
    setTitleInput(collectionsTitle);
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: 0,
    });
    setEditingCollection(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      image_url: collection.image_url || '',
      is_active: collection.is_active ?? true,
      sort_order: collection.sort_order ?? 0,
    });
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[char] || char;
      })
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !editingCollection ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Заполните название и slug');
      return;
    }

    try {
      if (editingCollection) {
        await updateCollection.mutateAsync({
          id: editingCollection.id,
          data: formData,
        });
        toast.success('Подборка обновлена');
      } else {
        await createCollection.mutateAsync(formData);
        toast.success('Подборка создана');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить подборку?')) return;
    try {
      await deleteCollection.mutateAsync(id);
      toast.success('Подборка удалена');
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  const openProductsDialog = (collection: Collection) => {
    setSelectedCollection(collection);
    setProductsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const handleSaveTitle = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'collections_title', value: titleInput });
      setTitleEdited(false);
      toast.success('Заголовок сохранён');
    } catch (error) {
      toast.error('Ошибка при сохранении заголовка');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Подборки</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Создать подборку
        </Button>
      </div>

      {/* Editable Title Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Заголовок блока подборок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={titleInput}
              onChange={(e) => {
                setTitleInput(e.target.value);
                setTitleEdited(true);
              }}
              placeholder="Введите заголовок"
              className="flex-1"
            />
            <Button 
              onClick={handleSaveTitle} 
              disabled={!titleEdited || updateSetting.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections?.map((collection) => (
          <Card key={collection.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {collection.image_url ? (
                <img
                  src={collection.image_url}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {!collection.is_active && (
                <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
                  Неактивна
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{collection.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {collection.description || 'Без описания'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openProductsDialog(collection)}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Товары
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(collection)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(collection.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!collections || collections.length === 0) && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Подборки пока не созданы</p>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editingCollection ? 'Редактировать подборку' : 'Создать подборку'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-auto pr-4">
          <div className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Новый год"
              />
            </div>

            <div>
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="new-year"
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание подборки"
              />
            </div>

            <div>
              <Label>Обложка</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              />
            </div>

            <div>
              <Label>Порядок сортировки</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Активна</Label>
            </div>
          </div>
          </ScrollArea>

          <div className="flex gap-2 justify-end flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit}>
              {editingCollection ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products Dialog */}
      {selectedCollection && (
        <ProductsDialog
          collection={selectedCollection}
          open={productsDialogOpen}
          onOpenChange={setProductsDialogOpen}
        />
      )}
    </div>
  );
};

interface ProductsDialogProps {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductsDialog = ({ collection, open, onOpenChange }: ProductsDialogProps) => {
  const { data: collectionProducts } = useCollectionProducts(collection.id);
  const { data: allProducts } = useProducts({});
  const addProduct = useAddProductToCollection();
  const removeProduct = useRemoveProductFromCollection();

  const collectionProductIds = new Set(collectionProducts?.map(cp => cp.product_id) || []);

  const handleToggleProduct = async (productId: string, isInCollection: boolean) => {
    try {
      if (isInCollection) {
        await removeProduct.mutateAsync({
          collectionId: collection.id,
          productId,
        });
        toast.success('Товар удалён из подборки');
      } else {
        await addProduct.mutateAsync({
          collectionId: collection.id,
          productId,
        });
        toast.success('Товар добавлен в подборку');
      }
    } catch (error) {
      toast.error('Ошибка при обновлении');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Товары в подборке "{collection.name}"</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-2">
            {allProducts?.map((product) => {
              const isInCollection = collectionProductIds.has(product.id);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50"
                >
                  <Checkbox
                    checked={isInCollection}
                    onCheckedChange={() => handleToggleProduct(product.id, isInCollection)}
                  />
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.price} ₽</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCollections;
