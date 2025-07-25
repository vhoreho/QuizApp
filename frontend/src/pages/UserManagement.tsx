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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <PersonIcon className="h-6 w-6" />
                User Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage user accounts and permissions
              </p>
            </div>
          </div>

          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center" size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <CreateUserForm onSuccess={() => setIsCreateUserOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <UserStatisticsCards total={usersData?.total || 0} />
        </div>

        {/* Users Table Section */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Users List</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
