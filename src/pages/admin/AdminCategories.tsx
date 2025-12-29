import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Category, CategoryInsert } from '@/services/categories';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface CategoryAddon {
  id: string;
  category_id: string;
  name: string;
  price: number;
  sort_order: number;
  is_active: boolean;
}

interface SortableRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onManageAddons: (category: Category) => void;
  addonsCount: number;
}

function SortableRow({ category, onEdit, onDelete, onManageAddons, addonsCount }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: category.id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-colors duration-200',
        isDragging && 'opacity-50 bg-primary/5 shadow-lg'
      )}
    >
      <TableCell>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {category.image_url && (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div>
            <div className="font-medium">{category.name}</div>
            {category.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {category.description}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {addonsCount} {addonsCount === 1 ? 'опция' : addonsCount >= 2 && addonsCount <= 4 ? 'опции' : 'опций'}
        </span>
      </TableCell>
      <TableCell>
        {category.is_active ? (
          <span className="inline-flex items-center gap-1 text-green-600">
            <Eye className="w-4 h-4" />
            Активна
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <EyeOff className="w-4 h-4" />
            Скрыта
          </span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onManageAddons(category)}
            title="Доп. опции"
          >
            <Package className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Товары в этой категории потеряют привязку.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(category.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddonsDialogOpen, setIsAddonsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [managingCategory, setManagingCategory] = useState<Category | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [categoryAddons, setCategoryAddons] = useState<CategoryAddon[]>([]);
  const [allAddons, setAllAddons] = useState<Record<string, CategoryAddon[]>>({});
  const [newAddon, setNewAddon] = useState({ name: '', price: 0 });
  const [editingAddon, setEditingAddon] = useState<CategoryAddon | null>(null);
  const [formData, setFormData] = useState<CategoryInsert>({
    slug: '',
    name: '',
    description: '',
    image_url: '',
    sort_order: 0,
    is_active: true,
  });

  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();

  const activeCategory = activeId ? categories?.find(c => c.id === activeId) : null;

  // Fetch all addons on mount
  useEffect(() => {
    const fetchAllAddons = async () => {
      const { data } = await supabase
        .from('category_addons')
        .select('*')
        .order('sort_order');
      
      if (data) {
        const grouped: Record<string, CategoryAddon[]> = {};
        data.forEach((addon: CategoryAddon) => {
          if (!grouped[addon.category_id]) {
            grouped[addon.category_id] = [];
          }
          grouped[addon.category_id].push(addon);
        });
        setAllAddons(grouped);
      }
    };
    fetchAllAddons();
  }, []);

  // Fetch addons for specific category
  const fetchCategoryAddons = async (categoryId: string) => {
    const { data } = await supabase
      .from('category_addons')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');
    
    if (data) {
      setCategoryAddons(data as CategoryAddon[]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id && categories) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      
      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      
      try {
        const updatePromises = reorderedCategories.map((category, index) =>
          updateMutation.mutateAsync({
            id: category.id,
            category: { sort_order: index },
          })
        );
        await Promise.all(updatePromises);
        toast.success('Порядок категорий обновлён');
      } catch (error) {
        toast.error('Ошибка при обновлении порядка');
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleManageAddons = async (category: Category) => {
    setManagingCategory(category);
    await fetchCategoryAddons(category.id);
    setIsAddonsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          category: formData,
        });
        toast.success('Категория обновлена');
      } else {
        const newSortOrder = categories?.length || 0;
        await createMutation.mutateAsync({ ...formData, sort_order: newSortOrder });
        toast.success('Категория создана');
      }
      resetForm();
    } catch (error) {
      toast.error('Ошибка при сохранении категории');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Категория удалена');
    } catch (error) {
      toast.error('Ошибка при удалении категории');
    }
  };

  // Addon management
  const handleAddAddon = async () => {
    if (!managingCategory || !newAddon.name.trim()) return;

    const { error } = await supabase
      .from('category_addons')
      .insert({
        category_id: managingCategory.id,
        name: newAddon.name.trim(),
        price: newAddon.price,
        sort_order: categoryAddons.length,
      });

    if (error) {
      toast.error('Ошибка добавления опции');
      return;
    }

    toast.success('Опция добавлена');
    setNewAddon({ name: '', price: 0 });
    await fetchCategoryAddons(managingCategory.id);
    refreshAllAddons();
  };

  const handleUpdateAddon = async () => {
    if (!editingAddon) return;

    const { error } = await supabase
      .from('category_addons')
      .update({
        name: editingAddon.name,
        price: editingAddon.price,
        is_active: editingAddon.is_active,
      })
      .eq('id', editingAddon.id);

    if (error) {
      toast.error('Ошибка обновления опции');
      return;
    }

    toast.success('Опция обновлена');
    setEditingAddon(null);
    if (managingCategory) {
      await fetchCategoryAddons(managingCategory.id);
    }
    refreshAllAddons();
  };

  const handleDeleteAddon = async (addonId: string) => {
    const { error } = await supabase
      .from('category_addons')
      .delete()
      .eq('id', addonId);

    if (error) {
      toast.error('Ошибка удаления опции');
      return;
    }

    toast.success('Опция удалена');
    if (managingCategory) {
      await fetchCategoryAddons(managingCategory.id);
    }
    refreshAllAddons();
  };

  const refreshAllAddons = async () => {
    const { data } = await supabase
      .from('category_addons')
      .select('*')
      .order('sort_order');
    
    if (data) {
      const grouped: Record<string, CategoryAddon[]> = {};
      data.forEach((addon: CategoryAddon) => {
        if (!grouped[addon.category_id]) {
          grouped[addon.category_id] = [];
        }
        grouped[addon.category_id].push(addon);
      });
      setAllAddons(grouped);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      slug: '',
      name: '',
      description: '',
      image_url: '',
      sort_order: 0,
      is_active: true,
    });
    setIsDialogOpen(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление категориями</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Перетаскивайте категории для изменения порядка
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить категорию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      name,
                      slug: !editingCategory ? generateSlug(name) : prev.slug,
                    }));
                  }}
                  placeholder="Введите название категории"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-slug"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание категории"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Изображение</Label>
                <ImageUpload
                  value={formData.image_url || ''}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  folder="categories"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Активна</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Addons Management Dialog */}
      <Dialog open={isAddonsDialogOpen} onOpenChange={setIsAddonsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Доп. опции для категории: {managingCategory?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add new addon */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Добавить опцию</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Название опции"
                    value={newAddon.name}
                    onChange={(e) => setNewAddon(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Цена"
                    value={newAddon.price || ''}
                    onChange={(e) => setNewAddon(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-32"
                  />
                  <Button onClick={handleAddAddon} disabled={!newAddon.name.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing addons */}
            <div className="space-y-2">
              <h3 className="font-medium">Текущие опции</h3>
              {categoryAddons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Нет добавленных опций
                </p>
              ) : (
                <div className="space-y-2">
                  {categoryAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      {editingAddon?.id === addon.id ? (
                        <>
                          <Input
                            value={editingAddon.name}
                            onChange={(e) => setEditingAddon(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={editingAddon.price}
                            onChange={(e) => setEditingAddon(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                            className="w-32"
                          />
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editingAddon.is_active}
                              onCheckedChange={(checked) => setEditingAddon(prev => prev ? { ...prev, is_active: checked } : null)}
                            />
                          </div>
                          <Button size="sm" onClick={handleUpdateAddon}>
                            Сохранить
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingAddon(null)}>
                            Отмена
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className={cn(!addon.is_active && 'text-muted-foreground line-through')}>
                              {addon.name}
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            +{formatPrice(addon.price)} ₽
                          </span>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            addon.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          )}>
                            {addon.is_active ? 'Активна' : 'Скрыта'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingAddon(addon)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить опцию?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Опция "{addon.name}" будет удалена.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAddon(addon.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      ) : !categories?.length ? (
        <div className="text-center py-8 text-muted-foreground">Нет категорий</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-24">Доп. опции</TableHead>
                  <TableHead className="w-24">Статус</TableHead>
                  <TableHead className="w-32">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={categories.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {categories.map((category) => (
                    <SortableRow
                      key={category.id}
                      category={category}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onManageAddons={handleManageAddons}
                      addonsCount={allAddons[category.id]?.length || 0}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
            <DragOverlay>
              {activeCategory ? (
                <div className="flex items-center gap-3 bg-background border rounded-lg p-3 shadow-xl animate-scale-in">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  {activeCategory.image_url && (
                    <img
                      src={activeCategory.image_url}
                      alt={activeCategory.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{activeCategory.name}</div>
                    <div className="text-sm text-muted-foreground">{activeCategory.slug}</div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
