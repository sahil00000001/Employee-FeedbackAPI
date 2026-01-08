import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center">
      <div className="bg-white p-4 rounded-full shadow-lg border border-slate-100 mb-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <p className="text-slate-500 font-medium animate-pulse">Loading data...</p>
    </div>
  );
}

export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center text-center p-6">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <svg
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-900">Something went wrong</h3>
      <p className="text-slate-500 mt-2 max-w-sm">{message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
