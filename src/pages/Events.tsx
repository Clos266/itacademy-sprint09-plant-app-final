import { useState } from "react";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, Filter, Search, Plus } from "lucide-react";
import { mockEvents } from "@/data/mockEvents";
import { mockUsers } from "@/data/mockUsers";

export default function EventsPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<"all" | "upcoming" | "past">(
    "all"
  );
  const [search, setSearch] = useState("");

  // 🔹 Filtering + search
  const filteredEvents = mockEvents.filter((event) => {
    const isUpcoming = new Date(event.date) > new Date();
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "upcoming") return isUpcoming;
    if (filterType === "past") return !isUpcoming;
    return true;
  });

  const selectedEvent =
    filteredEvents.find((e) => e.id === selectedEventId) || null;

  return (
    <div className="min-h-screen space-y-6">
      <PageHeader>
        <PageHeaderHeading>
          <CalendarDays className="inline-block w-6 h-6 mr-2 text-primary" />
          Community Events
        </PageHeaderHeading>
      </PageHeader>

      {/* 🔍 Search + Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
          {/* Search field */}
          <div className="flex items-center gap-2 w-full md:w-1/2">
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={filterType === "past" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("past")}
            >
              Past
            </Button>
            <Button className="ml-auto">
              <Plus />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 📅 Event list */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const isUpcoming = new Date(event.date) > new Date();
          const isSelected = selectedEventId === event.id;
          const organizer = mockUsers.find((u) => u.id === event.user_id);

          return (
            <Card
              key={event.id}
              className={`transition-all cursor-pointer overflow-hidden ${
                isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedEventId(event.id)}
            >
              {/* 📸 Event image */}
              <div className="relative h-48 w-full">
                <img
                  src={event.image_url || "/placeholder-event.jpg"}
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={isUpcoming ? "default" : "secondary"}>
                    {isUpcoming ? "Upcoming" : "Past"}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold truncate">{event.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {event.description}
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{event.location}</span>
                </div>

                {organizer && (
                  <div className="flex items-center gap-2 text-sm">
                    <img
                      src={organizer.avatar_url}
                      alt={organizer.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-muted-foreground">
                      by {organizer.username}
                    </span>
                  </div>
                )}

                {isUpcoming && (
                  <Button
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Viewing details for: ${event.title}`);
                    }}
                  >
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No {filterType !== "all" ? filterType : ""} events found.
              </p>
              <Button onClick={() => setFilterType("all")}>Show All</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
