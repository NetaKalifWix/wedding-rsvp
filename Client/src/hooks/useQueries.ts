// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { httpRequests } from "../httpClient";
// import { WeddingDetails } from "../types";

// // Query keys factory for consistency
// export const queryKeys = {
//   weddingInfo: (userId: string) => ["weddingInfo", userId] as const,
//   guests: (userId: string) => ["guests", userId] as const,
//   tasks: (userId: string) => ["tasks", userId] as const,
//   budgetOverview: (userId: string) => ["budgetOverview", userId] as const,
//   budgetCategories: (userId: string) => ["budgetCategories", userId] as const,
//   vendors: (userId: string) => ["vendors", userId] as const,
// };

// export type WeddingInfo = (WeddingDetails & { imageURL: string }) | null;

// /**
//  * Hook to fetch and cache wedding info
//  * - Caches data for 5 minutes (staleTime)
//  * - Keeps cache for 30 minutes (gcTime)
//  * - Automatically refetches when stale
//  */
// export const useWeddingInfo = (userId?: string) => {
//   return useQuery({
//     queryKey: queryKeys.weddingInfo(userId ?? ""),
//     queryFn: () => httpRequests.getWeddingInfo(userId!),
//     enabled: !!userId,
//     staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh
//     gcTime: 1000 * 60 * 30, // 30 minutes - cache is kept in memory
//   });
// };

// /**
//  * Hook to invalidate wedding info cache
//  * Useful after updating wedding info
//  */
// export const useInvalidateWeddingInfo = () => {
//   const queryClient = useQueryClient();

//   return (userId: string) => {
//     queryClient.invalidateQueries({
//       queryKey: queryKeys.weddingInfo(userId),
//     });
//   };
// };
