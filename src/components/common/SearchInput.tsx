import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder,
}: SearchInputProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      <Input
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <Button variant="ghost" size="icon" onClick={onClear}>
          <X className="w-4 h-4" />
        </Button>
      ) : (
        <Button variant="outline" size="icon">
          <Search className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
