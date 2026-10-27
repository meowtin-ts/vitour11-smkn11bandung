import { useEffect, useId, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDarkMode: boolean;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getVisiblePages(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis-end", totalPages];
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis-start", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages];
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  isDarkMode,
}: AdminPaginationProps) {
  const [pageInput, setPageInput] = useState(String(currentPage));
  const pageListId = useId();

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const pageItems = getVisiblePages(currentPage, totalPages);
  const buttonBase =
    "flex h-10 min-w-10 items-center justify-center rounded-xl border text-sm font-extrabold transition-all disabled:cursor-not-allowed disabled:opacity-35";
  const inactiveButton = isDarkMode
    ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-500/60 hover:bg-slate-800"
    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50";
  const commitPageInput = () => {
    const requestedPage = Number.parseInt(pageInput, 10);
    if (Number.isNaN(requestedPage)) {
      setPageInput(String(currentPage));
      return;
    }
    const nextPage = Math.min(totalPages, Math.max(1, requestedPage));
    setPageInput(String(nextPage));
    onPageChange(nextPage);
  };

  return (
    <nav
      aria-label="Navigasi halaman"
      className={`flex flex-col items-center justify-center gap-4 border-t pt-6 sm:flex-row sm:flex-wrap ${
        isDarkMode ? "border-slate-800" : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
          className={`${buttonBase} ${inactiveButton}`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          {pageItems.map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={`${buttonBase} ${
                  item === currentPage
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : inactiveButton
                }`}
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                className={`flex h-10 min-w-6 items-center justify-center text-sm ${
                  isDarkMode ? "text-slate-600" : "text-slate-400"
                }`}
              >
                …
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
          className={`${buttonBase} ${inactiveButton}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={`hidden h-8 w-px sm:block ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />

      <label
        className={`flex items-center gap-2 font-['Manrope'] text-sm font-bold ${
          isDarkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        <span>Page</span>
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={totalPages}
            list={pageListId}
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={commitPageInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitPageInput();
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                setPageInput(String(currentPage));
                event.currentTarget.blur();
              }
            }}
            aria-label="Ketik atau pilih nomor halaman"
            className={`h-10 w-20 rounded-xl border py-2 pl-3 pr-8 text-center text-sm font-extrabold outline-none transition-colors [appearance:textfield] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
              isDarkMode
                ? "border-slate-700 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          />
          <ChevronDown
            size={15}
            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${
              isDarkMode ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <datalist id={pageListId}>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
          </datalist>
        </div>
        <span>of {totalPages}</span>
      </label>
    </nav>
  );
}
