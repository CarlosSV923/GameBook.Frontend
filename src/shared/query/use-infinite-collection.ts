"use client";

import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { mergeCatalogItems } from "@/features/catalog/model/catalog-pagination";

type PageWithItems<T extends { igdbId: number }> = { items: T[] };
type CollectionOptions<
  TPage extends PageWithItems<T>,
  T extends { igdbId: number },
  TParam,
> = {
  enabled?: boolean;
  initialPageParam: TParam;
  queryKey: readonly unknown[];
  queryPage: (param: TParam, signal: AbortSignal) => Promise<TPage>;
  getNextPageParam: (page: TPage) => TParam | undefined;
  staleTime?: number;
};

export function flattenCollection<T extends { igdbId: number }>(
  data: InfiniteData<PageWithItems<T>> | undefined,
): T[] {
  let items: T[] = [];
  for (const page of data?.pages ?? [])
    items = mergeCatalogItems(items, page.items);
  return items;
}

export function useInfiniteCollection<
  TPage extends PageWithItems<T>,
  T extends { igdbId: number },
  TParam,
>({
  enabled = true,
  initialPageParam,
  queryKey,
  queryPage,
  getNextPageParam,
  staleTime,
}: CollectionOptions<TPage, T, TParam>) {
  return useInfiniteQuery<
    TPage,
    Error,
    InfiniteData<TPage>,
    readonly unknown[],
    TParam
  >({
    queryKey,
    enabled,
    initialPageParam,
    queryFn: ({ pageParam, signal }) => queryPage(pageParam as TParam, signal),
    getNextPageParam,
    staleTime,
  });
}
