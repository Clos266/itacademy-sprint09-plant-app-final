import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { NewPlantButton } from "@/components/Plants/NewPlantModal";
import { EditPlantModal } from "@/components/Plants/EditPlantModal";
import { PlantDetailsModal } from "@/components/Plants/PlantDetailsModal";
import { MyPlantsTable } from "@/components/Plants/MyPlantsTable";
import { useMyPlantsPage } from "@/hooks/useMyPlantsPage";
import { DOMAIN_FILTER_TYPES } from "@/constants/filterTypes";
import { SPACING } from "@/constants/layouts";

interface MyPlantsContainerProps {
  className?: string;
}

export function MyPlantsContainer({ className = "" }: MyPlantsContainerProps) {
  const {
    filteredPlants,
    stats,
    loading,
    error,
    selectedPlant,
    openEdit,
    openDetails,
    search,
    filterType,
    handleEdit,
    handleDelete,
    handleSave,
    handleOpenDetails,
    handleCloseEdit,
    handleCloseDetails,
    setSearch,
    setFilterType,
  } = useMyPlantsPage();

  if (loading) {
    return (
      <div className={`h-[60vh] ${className}`}>
        <LoadingState className="h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center mt-8 text-destructive ${className}`}>
        <div className="space-y-2">
          <p className="font-medium">Failed to load your plants</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${SPACING.PAGE.SECTION_GAP} ${className}`}>
      <PageHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <PageHeaderHeading>My Plants</PageHeaderHeading>
            {stats.total > 0 && (
              <p className="text-muted-foreground mt-2">
                {stats.total} plant{stats.total !== 1 ? "s" : ""} •{" "}
                {stats.available} available • {stats.completionRate}% complete
                profiles
              </p>
            )}
          </div>

          {stats.total > 0 && (
            <div className="hidden md:flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.available}
                </div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          )}
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <FilterBar
            searchComponent={
              <div className="w-full md:w-80">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch("")}
                  placeholder="Search your plants..."
                />
              </div>
            }
            filters={
              <div className="flex items-center gap-2 flex-wrap">
                {DOMAIN_FILTER_TYPES.PLANTS.STATUS.map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="capitalize"
                  >
                    {type === "all" ? "All Plants" : type}
                  </Button>
                ))}

                <div className="ml-auto">
                  <NewPlantButton />
                </div>
              </div>
            }
          />
        </CardContent>
      </Card>

      {filteredPlants.length === 0 && stats.total === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">No plants yet</h3>
                <p className="text-muted-foreground">
                  Start building your plant collection by adding your first
                  plant.
                </p>
              </div>
              <NewPlantButton />
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPlants.length === 0 && stats.total > 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">No plants found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find your plants.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilterType("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPlants.length > 0 && (
        <MyPlantsTable
          plants={filteredPlants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenDetails={handleOpenDetails}
        />
      )}

      <PlantDetailsModal
        open={openDetails}
        onOpenChange={handleCloseDetails}
        plantId={selectedPlant?.id || null}
      />

      <EditPlantModal
        open={openEdit}
        onOpenChange={handleCloseEdit}
        plant={selectedPlant}
        onSave={handleSave}
      />
    </div>
  );
}
