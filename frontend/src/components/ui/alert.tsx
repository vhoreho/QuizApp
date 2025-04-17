import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-success/50 bg-success/10 text-success dark:border-success [&>svg]:text-success",
        info: "border-info/50 bg-info/10 text-info dark:border-info [&>svg]:text-info",
        warning:
          "border-warning/50 bg-warning/10 text-warning dark:border-warning [&>svg]:text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    let defaultIcon = null;

    if (!icon) {
      switch (variant) {
        case "destructive":
          defaultIcon = <ExclamationTriangleIcon className="h-4 w-4" />;
          break;
        case "success":
          defaultIcon = <CheckCircledIcon className="h-4 w-4" />;
          break;
        case "info":
          defaultIcon = <InfoCircledIcon className="h-4 w-4" />;
          break;
        case "warning":
          defaultIcon = <QuestionMarkCircledIcon className="h-4 w-4" />;
          break;
        default:
          defaultIcon = null;
      }
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon || defaultIcon}
        {children}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
