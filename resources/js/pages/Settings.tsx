import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Edit, Loader2, Trash2 } from "lucide-react";
import {
  useYears,
  useCreateYear,
  useUpdateYear,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useApi";
import { Year, Category } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();

  const { data: years, isLoading: yearsLoading } = useYears();
  const createYearMutation = useCreateYear();
  const updateYearMutation = useUpdateYear();

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<Year | null>(null);
  const [title, setTitle] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const handleOpenCreate = () => {
    setEditingYear(null);
    setTitle("");
    setStartYear("");
    setEndYear("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (year: Year) => {
    setEditingYear(year);
    setTitle(year.title || "");
    setStartYear(year.start_year || "");
    setEndYear(year.end_year || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingYear) {
        await updateYearMutation.mutateAsync({
          id: editingYear.id,
          data: { title, start_year: startYear, end_year: endYear },
        });
      } else {
        await createYearMutation.mutateAsync({
          title,
          start_year: startYear,
          end_year: endYear,
        });
      }
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDialogOpen(true);
  };

  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: { name: categoryName.trim() },
        });
        toast({ title: "تم التحديث", description: "تم تحديث التصنيف" });
      } else {
        await createCategoryMutation.mutateAsync({ name: categoryName.trim() });
        toast({ title: "تمت الإضافة", description: "تمت إضافة التصنيف" });
      }
      setCategoryDialogOpen(false);
    } catch (e: any) {
      toast({
        title: "خطأ",
        description: e.response?.data?.message || "تعذّر حفظ التصنيف",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = (category: Category) => {
    if (!confirm(`هل تريد حذف التصنيف "${category.name}"؟`)) return;
    deleteCategoryMutation.mutate(category.id, {
      onSuccess: () => toast({ title: "تم الحذف", description: "تم حذف التصنيف" }),
      onError: (err: any) =>
        toast({
          title: "خطأ",
          description: err.response?.data?.message || "تعذّر الحذف",
          variant: "destructive",
        }),
    });
  };

  const isSaving = createYearMutation.isPending || updateYearMutation.isPending;
  const isSavingCategory =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-subtitle">إعدادات الحساب والتطبيق</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold mb-4">الملف الشخصي</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-lg">{user?.name}</p>
            <p className="text-sm text-muted-foreground">
              {user?.role === "admin" ? "مدير المدرسة" : "معلم"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Years Management - Admin Only */}
      {isAdmin && (
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">السنوات الدراسية</h2>
            <Button size="sm" variant="outline" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 me-2" />
              إضافة سنة
            </Button>
          </div>

          <div className="space-y-3">
            {yearsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              years?.map((year) => (
                <div
                  key={year.id}
                  className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-transparent hover:border-border transition-colors"
                >
                  <div>
                    <p className="font-medium">{year.name}</p>
                    {year.start_year && year.end_year && (
                      <p className="text-xs text-muted-foreground">
                        {year.start_year} - {year.end_year}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(year)}
                  >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))
            )}

            {!yearsLoading && years?.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">لا توجد سنوات دراسية مضافة</p>
            )}
          </div>
        </div>
      )}

      {/* Categories Management - Admin Only */}
      {isAdmin && (
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">تصنيفات الدورات</h2>
            <Button size="sm" variant="outline" onClick={handleOpenCreateCategory}>
              <Plus className="w-4 h-4 me-2" />
              إضافة تصنيف
            </Button>
          </div>

          <div className="space-y-3">
            {categoriesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              categories?.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-transparent hover:border-border transition-colors"
                >
                  <p className="font-medium">{category.name}</p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditCategory(category)}
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}

            {!categoriesLoading && categories?.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                لا توجد تصنيفات مضافة
              </p>
            )}
          </div>
        </div>
      )}

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 w-full sm:w-auto"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </Button>

      {/* Edit/Create Year Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingYear ? "تعديل السنة الدراسية" : "إضافة سنة دراسية جديدة"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">اللقب (مثل: فوج)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: الفوج الأول"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">سنة البدء</Label>
                <Input
                  id="start"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  maxLength={4}
                  placeholder="2023"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">سنة الانتهاء</Label>
                <Input
                  id="end"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  maxLength={4}
                  placeholder="2024"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {editingYear ? "حفظ التغييرات" : "إضافة السنة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">اسم التصنيف</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="مثال: بنين / بنات"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveCategory} disabled={isSavingCategory || !categoryName.trim()}>
              {isSavingCategory && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {editingCategory ? "حفظ التغييرات" : "إضافة التصنيف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
