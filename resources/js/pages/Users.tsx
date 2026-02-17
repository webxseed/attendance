import { useState } from "react";
import { useUsers, useCreateUser, useUpdateUser } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users as UsersIcon, Plus, Search, Mail, Phone, Loader2, Pencil, ShieldCheck, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/api";

export default function Users() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "teacher">("teacher");
  const [password, setPassword] = useState("");

  // API
  const { data: usersPage, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const users = usersPage?.data ?? [];

  const filtered = search
    ? users.filter(
      (u) =>
        u.name.includes(search) ||
        (u.email ?? "").includes(search) ||
        (u.phone ?? "").includes(search)
    )
    : users;

  const resetForm = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPhone("");
    setRole("teacher");
    setPassword("");
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setRole(user.role);
    setPassword(""); // Don't fill password on edit
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return;

    if (editingUser) {
      // Update
      updateMutation.mutate(
        {
          id: editingUser.id,
          data: {
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim(),
            role,
            ...(password ? { password } : {}),
          },
        },
        {
          onSuccess: () => {
            toast({
              title: "تم التحديث",
              description: "تم تحديث بيانات المستخدم بنجاح",
            });
            resetForm();
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast({
              title: "خطأ",
              description:
                err.response?.data?.message || "تعذّر تحديث المستخدم",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create
      createMutation.mutate(
        {
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim(),
          role,
          password: password || undefined,
        },
        {
          onSuccess: () => {
            toast({
              title: "تمت الإضافة",
              description: "تمت إضافة المستخدم بنجاح",
            });
            resetForm();
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast({
              title: "خطأ",
              description:
                err.response?.data?.message || "تعذّر إضافة المستخدم",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">المستخدمون</h1>
        <p className="page-subtitle">إدارة المعلمين والإداريين في النظام</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>الاسم الكامل <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="الاسم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الدور</Label>
                  <Select value={role} onValueChange={(v: any) => setRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">معلم</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>البريد الإلكتروني (اختياري)</Label>
                <Input
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label>{editingUser ? "كلمة المرور (اتركها فارغة للإبقاء)" : "كلمة المرور (اختياري)"}</Label>
                <Input
                  type="password"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="text-right"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={
                    (editingUser ? updateMutation.isPending : createMutation.isPending) ||
                    !name.trim() || !phone.trim()
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "حفظ"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 w-full sm:w-56"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user) => (
            <div key={user.id} className="stat-card animate-fade-in relative group flex flex-col">
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(user)}
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                  {user.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {user.role === 'admin' ? 'مدير نظام' : 'معلم'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{user.phone}</span>
                </div>
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border">
              <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>لا يوجد مستخدمين</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
