import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { CatalogList } from "@/features/catalog/ui/catalog-list";
import { HomeIntro } from "@/features/layout/ui/home-intro";
import { getIgdbServerClient } from "@/server/igdb/igdb-route";
import { getNextCatalogOffset } from "@/features/catalog/model/catalog-pagination";
import type { IgdbCatalogPage } from "@/features/catalog/model/igdb";
import { collectionKeys } from "@/shared/query/query-keys";
import { AppShell } from "@/features/layout/ui/app-shell";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function Home() {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: collectionKeys.catalog({}),
      initialPageParam: 0,
      queryFn: () =>
        getIgdbServerClient().getCatalog({ limit: PAGE_SIZE, offset: 0 }),
      getNextPageParam: (page: IgdbCatalogPage) =>
        page.hasNext ? getNextCatalogOffset(page) : undefined,
    });
  } catch {
    // The client catalog handles missing configuration and upstream failures.
  }

  return (
    <AppShell>
      <main className="mx-auto grid w-[calc(100%-32px)] max-w-[1120px] gap-6 pb-16 pt-6 md:w-[calc(100%-48px)] md:gap-8 md:pt-8">
        <HomeIntro />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <section className="catalog-preview" id="catalog">
            <CatalogList />
          </section>
        </HydrationBoundary>
      </main>
    </AppShell>
  );
}
