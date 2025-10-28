import { Button } from "@/components/ui/button";
import { PaginatedTable } from "@/components/common/PaginatedTable";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, ImageIcon } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { PAGINATION_SIZES } from "@/constants/pagination";
import {
  getPlantDisplayName,
  getPlantImageUrl,
  getPlantAvailabilityStatus,
} from "@/utils/myPlantsFiltering";
import type { Database } from "@/types/supabase";

type Plant = Database["public"]["Tables"]["plants"]["Row"];

interface MyPlantsTableProps {
  plants: Plant[];
  onEdit: (plant: Plant) => void;
  onDelete: (id: number) => Promise<void>;
  onOpenDetails: (plant: Plant) => void;
  readOnly?: boolean;
  className?: string;
}

export function MyPlantsTable({
  plants,
  onEdit,
  onDelete,
  onOpenDetails,
  readOnly = false,
  className = "",
}: MyPlantsTableProps) {
  const { page, totalPages, paginated, goToPage } = usePagination(
    plants,
    PAGINATION_SIZES.TABLE
  );

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (plant: Plant) => (
        <div className="flex items-center justify-center">
          <div
            className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted cursor-pointer transition-transform hover:scale-105 duration-200"
            onClick={() => onOpenDetails(plant)}
          >
            {plant.image_url ? (
              <img
                src={getPlantImageUrl(plant)}
                alt={`${getPlantDisplayName(plant)} - Plant photo`}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                plant.image_url ? "hidden" : ""
              }`}
            >
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "names",
      header: "Plant Information",
      render: (plant: Plant) => (
        <div className="space-y-1">
          <div className="font-medium truncate max-w-[150px]">
            {getPlantDisplayName(plant)}
          </div>
          {plant.nombre_cientifico && (
            <div className="text-sm text-muted-foreground italic truncate max-w-[120px]">
              {plant.nombre_cientifico}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "availability",
      header: "Status",
      render: (plant: Plant) => {
        const status = getPlantAvailabilityStatus(plant);
        return (
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
        );
      },
    },
    {
      key: "species",
      header: "Species & Family",
      render: (plant: Plant) => (
        <div className="max-w-[200px] space-y-1">
          {plant.especie && (
            <p className="text-sm text-muted-foreground truncate">
              {plant.especie}
            </p>
          )}
          {plant.familia && (
            <p className="text-xs text-muted-foreground/70 truncate">
              Family: {plant.familia}
            </p>
          )}
          {!plant.especie && !plant.familia && (
            <span className="text-xs text-muted-foreground italic">
              No species info
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (plant: Plant) => (
        <PlantActionsCell
          plant={plant}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenDetails={onOpenDetails}
          readOnly={readOnly}
        />
      ),
    },
  ];

  return (
    <div className={className}>
      <PaginatedTable
        data={paginated}
        columns={columns}
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}

interface PlantActionsCellProps {
  plant: Plant;
  onEdit: (plant: Plant) => void;
  onDelete: (id: number) => Promise<void>;
  onOpenDetails: (plant: Plant) => void;
  readOnly?: boolean;
}

function PlantActionsCell({
  plant,
  onEdit,
  onDelete,
  onOpenDetails,
  readOnly = false,
}: PlantActionsCellProps) {
  const displayName = getPlantDisplayName(plant);

  return (
    <div className="flex items-center gap-2">
      {/* View Details Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onOpenDetails(plant)}
        className="transition-colors duration-200"
        title={`View details of ${displayName}`}
      >
        <Eye className="w-4 h-4" />
      </Button>

      {/* Edit Button */}
      {!readOnly && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(plant)}
          className="transition-colors duration-200"
          title={`Edit ${displayName}`}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      )}

      {/* Delete Button with Confirmation */}
      {!readOnly && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              className="transition-colors duration-200"
              title={`Delete ${displayName}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Plant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{displayName}</span>? This
                action cannot be undone and will also remove any associated swap
                proposals.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(plant.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Plant
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Read-Only State Indicator */}
      {readOnly && (
        <span className="text-xs text-muted-foreground italic">View Only</span>
      )}
    </div>
  );
}
