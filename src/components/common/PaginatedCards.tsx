import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import type { PaginatedCardsProps } from "@/types/ui";

export function PaginatedCards<T>({
  data,
  renderCard,
  page,
  totalPages,
  onPageChange,
  emptyMessage = "No items found.",
}: PaginatedCardsProps<T>) {
  return (
    <div className="mt-6 space-y-6">
      {/* 🪴 Grid de Cards */}
      {data.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item, i) => (
            <div key={i}>{renderCard(item)}</div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                aria-disabled={page === 1}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <Button
                  variant={page === i + 1 ? "default" : "ghost"}
                  onClick={() => onPageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
