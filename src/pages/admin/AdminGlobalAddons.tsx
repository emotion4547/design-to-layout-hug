import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface GlobalAddon {
  id: string;
  name: string;
  price: number;
  sort_order: number;
  is_active: boolean;
  is_global: boolean;
}

export default function AdminGlobalAddons() {
  const [addons, setAddons] = useState<GlobalAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAddon, setNewAddon] = useState({ name: '', price: 0 });
  const [editingAddon, setEditingAddon] = useState<GlobalAddon | null>(null);

  const fetchAddons = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('category_addons')
      .select('*')
      .eq('is_global', true)
      .order('sort_order');

    if (error) {
      toast.error('Ошибка загрузки');
      console.error(error);
    } else {
      setAddons(data as GlobalAddon[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleAddAddon = async () => {
    if (!newAddon.name.trim()) {
      toast.error('Введите название');
      return;
    }

    const { error } = await supabase
      .from('category_addons')
      .insert({
        name: newAddon.name.trim(),
        price: newAddon.price,
        sort_order: addons.length,
        is_global: true,
        category_id: null,
      });

    if (error) {
      toast.error('Ошибка добавления');
      console.error(error);
      return;
    }

    toast.success('Опция добавлена');
    setNewAddon({ name: '', price: 0 });
    fetchAddons();
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
      toast.error('Ошибка обновления');
      console.error(error);
      return;
    }

    toast.success('Опция обновлена');
    setEditingAddon(null);
    fetchAddons();
  };

  const handleDeleteAddon = async (addonId: string) => {
    const { error } = await supabase
      .from('category_addons')
      .delete()
      .eq('id', addonId);

    if (error) {
      toast.error('Ошибка удаления');
      console.error(error);
      return;
    }

    toast.success('Опция удалена');
    fetchAddons();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Глобальные доп. опции
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Эти опции отображаются для всех товаров независимо от категории
        </p>
      </div>

      {/* Add new addon */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Добавить глобальную опцию</CardTitle>
          <CardDescription>
            Опция будет доступна для всех товаров на сайте
          </CardDescription>
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
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing addons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Текущие глобальные опции</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : addons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет глобальных опций. Добавьте первую!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead className="w-32">Цена</TableHead>
                  <TableHead className="w-24">Статус</TableHead>
                  <TableHead className="w-32">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addons.map((addon) => (
                  <TableRow key={addon.id}>
                    {editingAddon?.id === addon.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editingAddon.name}
                            onChange={(e) => setEditingAddon(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingAddon.price}
                            onChange={(e) => setEditingAddon(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editingAddon.is_active}
                              onCheckedChange={(checked) => setEditingAddon(prev => prev ? { ...prev, is_active: checked } : null)}
                            />
                            <Label className="text-xs">
                              {editingAddon.is_active ? 'Вкл' : 'Выкл'}
                            </Label>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={handleUpdateAddon}>
                              Сохранить
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingAddon(null)}>
                              Отмена
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <span className={cn(!addon.is_active && 'text-muted-foreground line-through')}>
                            {addon.name}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          +{formatPrice(addon.price)} ₽
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            addon.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          )}>
                            {addon.is_active ? 'Активна' : 'Скрыта'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
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
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
