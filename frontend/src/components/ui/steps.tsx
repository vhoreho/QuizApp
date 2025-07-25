import React from "react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep >= step.id;
          const isComplete = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Шаг */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full w-8 h-8 text-sm font-medium border transition-all z-10",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-muted-foreground/30 text-muted-foreground",
                    isComplete &&
                      "bg-primary text-primary-foreground border-primary"
                  )}
                >
                  {isComplete ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div
                  className={cn(
                    "mt-2 text-xs text-center",
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </div>
              </div>

              {/* Линия соединения (кроме последнего элемента) */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-1">
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      currentStep > step.id
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
