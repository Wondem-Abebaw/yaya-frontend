import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Filter,
  DollarSign,
} from "lucide-react";

// Types - Updated to match backend
interface TransactionUser {
  name: string;
  account: string;
}

interface Transaction {
  id: string;
  sender: TransactionUser;
  receiver: TransactionUser;
  amount_with_currency: string;
  amount: number;
  amount_in_base_currency: number;
  fee: number;
  currency: string;
  cause: string;
  sender_caption: string;
  receiver_caption: string;
  created_at_time: number;
  is_topup: boolean;
  is_outgoing_transfer: boolean;
  fee_vat: number;
  fee_before_vat: number;
}

interface PaginatedResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  incomingSum?: number;
  outgoingSum?: number;
  lastPage?: number;
  perPage?: number;
}

// Configuration - Using Vite's import.meta.env
const API_BASE_URL = "http://localhost:3001"; // In Vite: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const CURRENT_USER = "current_user"; // In Vite: import.meta.env.VITE_CURRENT_USER || 'current_user'

// Utility functions
const formatDate = (timestamp: number): string => {
  try {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

const formatAmount = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "ETB",
    minimumFractionDigits: 2,
  }).format(amount);
};

const isIncomingTransaction = (
  transaction: Transaction,
  currentUser: string
): boolean => {
  // Incoming: receiver account is current user OR it's a top-up
  return (
    transaction.receiver.account === currentUser ||
    transaction.is_topup ||
    transaction.sender.account === transaction.receiver.account
  );
};

// Custom hooks
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Components
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    <span className="ml-2 text-gray-600">Loading transactions...</span>
  </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="flex flex-col justify-center items-center py-8 bg-red-50 rounded-lg border border-red-200">
    <AlertCircle className="mb-4 w-12 h-12 text-red-500" />
    <p className="mb-4 text-center text-red-700">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

const TransactionRow: React.FC<{
  transaction: Transaction;
  isIncoming: boolean;
}> = ({ transaction, isIncoming }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50">
    <td className="px-4 py-3 text-sm">
      <div className="flex items-center">
        {isIncoming ? (
          <ArrowDownLeft className="mr-2 w-4 h-4 text-green-600" />
        ) : (
          <ArrowUpRight className="mr-2 w-4 h-4 text-red-600" />
        )}
        <span className="font-mono text-xs">{transaction.id}</span>
      </div>
    </td>
    <td className="px-4 py-3 text-sm">
      <div>
        <div className="font-medium text-gray-900">
          {transaction.sender.name}
        </div>
        <div className="text-xs text-gray-500">
          @{transaction.sender.account}
        </div>
      </div>
    </td>
    <td className="px-4 py-3 text-sm">
      <div>
        <div className="font-medium text-gray-900">
          {transaction.receiver.name}
        </div>
        <div className="text-xs text-gray-500">
          @{transaction.receiver.account}
        </div>
      </div>
    </td>
    <td className="px-4 py-3 text-sm">
      <div className="flex flex-col">
        <span
          className={`font-semibold ${
            isIncoming ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncoming ? "+" : "-"}
          {formatAmount(transaction.amount, transaction.currency)}
        </span>
        {transaction.fee > 0 && (
          <span className="text-xs text-gray-500">
            Fee: {formatAmount(transaction.fee, transaction.currency)}
          </span>
        )}
      </div>
    </td>
    <td className="px-4 py-3 text-sm text-gray-900">{transaction.currency}</td>
    <td className="px-4 py-3 text-sm">
      <div className="flex flex-col">
        <span className="text-gray-900">{transaction.cause || "N/A"}</span>
        {transaction.is_topup && (
          <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium text-green-800 bg-green-100 rounded-full w-fit">
            Top-up
          </span>
        )}
      </div>
    </td>
    <td className="px-4 py-3 text-sm text-gray-500">
      {formatDate(transaction.created_at_time)}
    </td>
  </tr>
);

const TransactionCard: React.FC<{
  transaction: Transaction;
  isIncoming: boolean;
}> = ({ transaction, isIncoming }) => (
  <div className="p-4 mb-3 bg-white rounded-lg border border-gray-200 shadow-sm">
    {/* Header with amount and date */}
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center">
        {isIncoming ? (
          <ArrowDownLeft className="flex-shrink-0 mr-2 w-5 h-5 text-green-600" />
        ) : (
          <ArrowUpRight className="flex-shrink-0 mr-2 w-5 h-5 text-red-600" />
        )}
        <div>
          <span
            className={`font-bold text-lg ${
              isIncoming ? "text-green-600" : "text-red-600"
            }`}
          >
            {isIncoming ? "+" : "-"}
            {formatAmount(transaction.amount, transaction.currency)}
          </span>
          {transaction.fee > 0 && (
            <div className="text-xs text-gray-500 mt-0.5">
              Fee: {formatAmount(transaction.fee, transaction.currency)}
            </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="mb-1 text-xs text-gray-500">
          {formatDate(transaction.created_at_time)}
        </div>
        {transaction.is_topup && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            Top-up
          </span>
        )}
      </div>
    </div>

    {/* Transaction details */}
    <div className="space-y-2.5 text-sm">
      {/* From */}
      <div>
        <div className="mb-1 text-xs font-bold text-gray-800">From</div>
        <div className="font-medium text-gray-600">
          {transaction.sender.name}
        </div>
        <div className="text-xs text-gray-500">
          @{transaction.sender.account}
        </div>
      </div>

      {/* To */}
      <div>
        <div className="mb-1 text-xs font-bold text-gray-800">To</div>
        <div className="font-medium text-gray-600">
          {transaction.receiver.name}
        </div>
        <div className="text-xs text-gray-500">
          @{transaction.receiver.account}
        </div>
      </div>

      {/* Cause */}
      {transaction.cause && (
        <div>
          <div className="mb-1 text-xs font-bold text-gray-800">Cause</div>
          <div className="text-gray-900">{transaction.cause}</div>
        </div>
      )}

      {/* Note */}
      {(transaction.sender_caption || transaction.receiver_caption) && (
        <div>
          <div className="mb-1 text-xs font-bold text-gray-800">Note</div>
          <div className="text-gray-900">
            {transaction.sender_caption || transaction.receiver_caption}
          </div>
        </div>
      )}

      {/* Transaction ID - at the bottom, less prominent */}
      <div className="pt-2 border-t border-gray-100">
        <div className="mb-1 text-xs font-bold text-gray-800">
          Transaction ID
        </div>
        <div className="font-mono text-xs text-gray-500 break-all">
          {transaction.id}
        </div>
      </div>
    </div>
  </div>
);

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
      <div className="flex justify-between w-full sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const TransactionDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [summaryStats, setSummaryStats] = useState({
    incomingSum: 0,
    outgoingSum: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Check if mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(
    async (page: number = 1, query: string = "") => {
      setIsLoading(true);
      setError(null);

      try {
        let url: string;
        let options: RequestInit;

        if (query.trim()) {
          // Search transactions
          url = `${API_BASE_URL}/api/transactions/search?page=${page}&limit=${pagination.limit}`;
          options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: query.trim() }),
          };
        } else {
          // Get all transactions
          url = `${API_BASE_URL}/api/transactions?page=${page}&limit=${pagination.limit}`;
          options = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          };
        }

        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PaginatedResponse = await response.json();
        setTransactions(data.data);
        setPagination(data.pagination);

        // Update summary stats
        setSummaryStats({
          incomingSum: data.incomingSum || 0,
          outgoingSum: data.outgoingSum || 0,
        });
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          "Failed to load transactions. Please check your connection and try again."
        );
        setTransactions([]);
        setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
        setSummaryStats({ incomingSum: 0, outgoingSum: 0 });
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit]
  );

  // Load transactions on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get("p");
    const initialPage = pageParam ? parseInt(pageParam, 10) : 1;

    setPagination((prev) => ({ ...prev, page: initialPage }));
    fetchTransactions(initialPage);
  }, [fetchTransactions]);

  // Handle search
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;

    const newPage = 1;
    setPagination((prev) => ({ ...prev, page: newPage }));

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("p", newPage.toString());
    window.history.replaceState({}, "", url.toString());

    fetchTransactions(newPage, debouncedSearchQuery);
  }, [debouncedSearchQuery, searchQuery, fetchTransactions]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages || isLoading) return;

    setPagination((prev) => ({ ...prev, page: newPage }));

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("p", newPage.toString());
    window.history.replaceState({}, "", url.toString());

    fetchTransactions(newPage, debouncedSearchQuery);
  };

  const handleRetry = () => {
    fetchTransactions(pagination.page, debouncedSearchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Transaction Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor your YaYa Wallet transactions
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>{pagination.total} transactions</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Summary Cards - Show when not loading and have data */}
        {!isLoading &&
          !error &&
          (summaryStats.incomingSum > 0 || summaryStats.outgoingSum > 0) && (
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <ArrowDownLeft className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Total Incoming
                    </p>
                    <p className="text-xl font-semibold text-green-600">
                      {formatAmount(summaryStats.incomingSum, "ETB")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <ArrowUpRight className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Total Outgoing
                    </p>
                    <p className="text-xl font-semibold text-red-600">
                      {formatAmount(summaryStats.outgoingSum, "ETB")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Net Balance
                    </p>
                    <p
                      className={`text-xl font-semibold ${
                        summaryStats.incomingSum - summaryStats.outgoingSum >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatAmount(
                        summaryStats.incomingSum - summaryStats.outgoingSum,
                        "ETB"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by sender, receiver, cause, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-3 pr-4 pl-10 w-full bg-white rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Searching for:{" "}
              <span className="font-semibold">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm">
          {error ? (
            <ErrorMessage message={error} onRetry={handleRetry} />
          ) : isLoading ? (
            <LoadingSpinner />
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No transactions found
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "No transactions available."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              {!isMobile ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Transaction ID
                        </th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Sender
                        </th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Receiver
                        </th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Currency
                        </th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Cause
                        </th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <TransactionRow
                          key={transaction.id}
                          transaction={transaction}
                          isIncoming={isIncomingTransaction(
                            transaction,
                            CURRENT_USER
                          )}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Mobile Card View */
                <div className="p-4">
                  {transactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      isIncoming={isIncomingTransaction(
                        transaction,
                        CURRENT_USER
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </div>

        {/* Transaction Count Summary */}
        {!isLoading && !error && transactions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <ArrowDownLeft className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Incoming (This Page)
                  </p>
                  <p className="text-2xl font-semibold text-green-600">
                    {
                      transactions.filter((t) =>
                        isIncomingTransaction(t, CURRENT_USER)
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <ArrowUpRight className="w-8 h-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Outgoing (This Page)
                  </p>
                  <p className="text-2xl font-semibold text-red-600">
                    {
                      transactions.filter(
                        (t) => !isIncomingTransaction(t, CURRENT_USER)
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Filter className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {pagination.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TransactionDashboard;
