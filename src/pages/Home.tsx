import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Leaf } from "lucide-react";
import { PlantBrowserContainer } from "@/components/Plants/PlantBrowserContainer";
import { SPACING } from "@/constants/layouts";

export default function HomePage() {
  return (
    <div className={`min-h-screen ${SPACING.PAGE.SECTION_GAP}`}>
      <PageHeader>
        <PageHeaderHeading>
          <Leaf className="inline-block w-6 h-6 mr-2 text-primary" />
          Browse Plants for Swap
        </PageHeaderHeading>
      </PageHeader>

      <PlantBrowserContainer className="space-y-6" />
    </div>
  );
}
