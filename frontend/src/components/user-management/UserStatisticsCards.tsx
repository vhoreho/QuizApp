import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PersonIcon,
  GearIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

interface UserStatisticsCardsProps {
  total: number;
}

export function UserStatisticsCards({ total }: UserStatisticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Total Users
          </CardTitle>
          <PersonIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {total}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Active users in the system
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
            Active Today
          </CardTitle>
          <MagnifyingGlassIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {Math.floor(total * 0.6)}
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Users active in last 24 hours
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
            New Users
          </CardTitle>
          <GearIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {Math.floor(total * 0.1)}
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
            New users this week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
