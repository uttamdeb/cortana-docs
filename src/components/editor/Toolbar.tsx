import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bold, Italic, Underline, List, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBulletList: () => void;
  onFontChange: (font: string) => void;
  onFontSizeChange: (size: string) => void;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  currentFont: string;
  currentFontSize: string;
  isMobile?: boolean;
}

const fonts = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
];

const fontSizes = [
  { value: "12", label: "12" },
  { value: "14", label: "14" },
  { value: "16", label: "16" },
  { value: "18", label: "18" },
  { value: "20", label: "20" },
  { value: "24", label: "24" },
  { value: "28", label: "28" },
  { value: "32", label: "32" },
];

export function Toolbar({
  onBold,
  onItalic,
  onUnderline,
  onBulletList,
  onFontChange,
  onFontSizeChange,
  isBold,
  isItalic,
  isUnderline,
  currentFont,
  currentFontSize,
  isMobile = false,
}: ToolbarProps) {
  return (
    <div className={cn(
      "glass-strong rounded-lg p-2 flex items-center gap-2 flex-wrap",
      isMobile ? "justify-center" : ""
    )}>
      {/* Font Family */}
      <Select value={currentFont} onValueChange={onFontChange}>
        <SelectTrigger className={cn("h-9 bg-background/50", isMobile ? "w-28" : "w-36")}>
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent className="glass-strong">
          {fonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span style={{ fontFamily: font.value }}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select value={currentFontSize} onValueChange={onFontSizeChange}>
        <SelectTrigger className="w-16 h-9 bg-background/50">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent className="glass-strong">
          {fontSizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

      {/* Formatting Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9", isBold && "bg-primary/20 text-primary")}
          onClick={onBold}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9", isItalic && "bg-primary/20 text-primary")}
          onClick={onItalic}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9", isUnderline && "bg-primary/20 text-primary")}
          onClick={onUnderline}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onBulletList}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

      {/* AI Button (Disabled) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="opacity-50 cursor-not-allowed"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Analyze with AI</span>
            <span className="sm:hidden">AI</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Coming Soon</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
