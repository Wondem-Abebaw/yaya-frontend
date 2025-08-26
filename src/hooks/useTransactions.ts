import { useState, useEffect, useCallback } from "react";
import { Transaction, PaginatedResponse } from "../types/transaction";
import { apiClient } from "../utils/api";

export const useTransactions = (initialPage: number = 1) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (page: number = 1, query: string = "") => {
      setIsLoading(true);
      setError(null);

      try {
        let response: PaginatedResponse<Transaction>;

        if (query.trim()) {
          response = await apiClient.post<PaginatedResponse<Transaction>>(
            "/api/transactions/search",
            { query: query.trim() },
            { page: page.toString(), limit: pagination.limit.toString() }
          );
          console.log("🚀 ~ useTransactions ~ response:", response)
        } else {
          response = await apiClient.get<PaginatedResponse<Transaction>>(
            "/api/transactions",
            { page: page.toString(), limit: pagination.limit.toString() }
          );
        }

        setTransactions(response.data);
        setPagination(response.pagination);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          "Failed to load transactions. Please check your connection and try again."
        );
        setTransactions([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit]
  );

  return {
    transactions,
    pagination,
    isLoading,
    error,
    fetchTransactions,
    setPagination,
  };
};
