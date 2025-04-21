import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { PageLayout } from "../components/layout/PageLayout";
import { ROUTES, PAGE_TITLES, MESSAGES } from "@/lib/constants";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageLayout showHeader={false}>
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-warning mb-6" />
        <h1 className="text-4xl font-bold mb-4">{PAGE_TITLES.NOT_FOUND}</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          {MESSAGES.COMMON.NOT_FOUND_MESSAGE}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            onClick={() => navigate(ROUTES.HOME)}
            className="min-w-[150px]"
          >
            {MESSAGES.COMMON.GO_HOME}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="min-w-[150px]"
          >
            <ReloadIcon className="mr-2 h-4 w-4" />
            {MESSAGES.COMMON.BACK}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
