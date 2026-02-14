import { ReactNode } from "react";

type LoadingLayoutProps = {
  message: string;
  icon?: ReactNode;
  showSpinner?: boolean;
  containerClassName?: string;
  messageClassName?: string;
};

export default function LoadingLayout({
  message,
  icon,
  showSpinner = true,
  containerClassName = "bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-white gap-6",
  messageClassName = "text-gray-600 dark:text-gray-400 font-bold tracking-widest uppercase text-xs animate-pulse",
}: LoadingLayoutProps) {
  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${containerClassName}`}
    >
      {showSpinner ? (
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : null}
      <div className="flex flex-col items-center space-y-2">
        {icon}
        <p className={messageClassName}>{message}</p>
      </div>
    </div>
  );
}
