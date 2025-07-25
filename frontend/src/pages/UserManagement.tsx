import { useNavigate } from "react-router-dom";
import { UserRole } from "../lib/types";
import { useUser } from "@/contexts/UserContext";
import { ArrowLeftIcon, PersonIcon, PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import {
  UserStatisticsCards,
  CreateUserForm,
  UsersTable,
} from "@/components/user-management";
import { useUsers } from "@/hooks/queries/useUsers";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserManagement() {
  const navigate = useNavigate();
  const { user: currentUser, isLoading: userLoading } = useUser();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const { data: usersData, isLoading } = useUsers({
    page: 1,
    limit: 10,
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (
    isLoading ||
    userLoading ||
    !currentUser ||
    currentUser.role !== UserRole.ADMIN
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-blue-500/5 to-violet-500/5">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-blue-500/5 to-violet-500/5">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 text-muted-foreground hover:text-foreground group"
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-600" />
              Панель управления
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10">
                  <PersonIcon className="h-6 w-6 text-blue-500" />
                </div>
                Управление пользователями
              </h1>
              <p className="text-sm text-muted-foreground">
                Управление учетными записями и правами доступа
              </p>
            </div>
          </div>

          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Добавить пользователя
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-sm border-border">
              <CreateUserForm onSuccess={() => setIsCreateUserOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <UserStatisticsCards total={usersData?.total || 0} />
        </div>

        {/* Users Table Section */}
        <Card className="border-border bg-background/60 backdrop-blur-sm">
          <CardHeader className="border-b border-border bg-blue-500/5">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <div className="p-1 rounded-md bg-blue-500/10">
                <PersonIcon className="h-4 w-4 text-blue-500" />
              </div>
              Список пользователей
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UsersTable />
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
