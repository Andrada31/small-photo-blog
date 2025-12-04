import { Suspense } from "react";
import { PortfolioHeader } from "@/components/portfolio-header";
import { PhotoGallery } from "@/components/photo-gallery";
import { getPhotos, getTotalPages, type PhotoCategory } from "@/lib/photo-data";

const PHOTOS_PER_PAGE = 40;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function PortfolioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const activeCategory = (params.category || "all") as PhotoCategory | "all";

  // Fetch photos from Supabase
  const { photos, total } = await getPhotos(
    activeCategory,
    currentPage,
    PHOTOS_PER_PAGE
  );
  const totalPages = getTotalPages(total, PHOTOS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <PortfolioHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
            My Small Photo Blog
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A curated collection of photographs exploring light, shadow, and the
            beauty found in everyday moments.
          </p>
        </section>

        {/* Photo Gallery with Client-side Interactivity */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-muted-foreground">
                Loading gallery...
              </div>
            </div>
          }
        >
          <PhotoGallery
            initialPhotos={photos}
            totalPhotos={total}
            currentPage={currentPage}
            totalPages={totalPages}
            activeCategory={activeCategory}
          />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2025 Andrada Paraczki Photography. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Flickr
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
