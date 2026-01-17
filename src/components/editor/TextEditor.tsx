import { useRef, useState, useEffect, useCallback } from "react";
import { Toolbar } from "./Toolbar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { sanitizeRichText } from "@/lib/sanitizeRichText";

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  username?: string;
  currentFont?: string;
  currentFontSize?: string;
  onFontChange?: (font: string) => void;
  onFontSizeChange?: (size: string) => void;
}

export function TextEditor({ 
  content, 
  onChange, 
  className, 
  username,
  currentFont = "Arial",
  currentFontSize = "16",
  onFontChange,
  onFontSizeChange
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = sanitizeRichText(content);
    }
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(sanitizeRichText(editorRef.current.innerHTML));
    }
  }, [onChange]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      // Prevent potentially dangerous HTML from being inserted into the editor.
      e.preventDefault();

      const html = e.clipboardData.getData("text/html");
      if (html) {
        document.execCommand("insertHTML", false, sanitizeRichText(html));
        return;
      }

      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
    []
  );

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateFormatState();
  };

  const updateFormatState = () => {
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));
  };

  const handleBold = () => {
    execCommand("bold");
    setIsBold(!isBold);
  };

  const handleItalic = () => {
    execCommand("italic");
    setIsItalic(!isItalic);
  };

  const handleUnderline = () => {
    execCommand("underline");
    setIsUnderline(!isUnderline);
  };

  const handleBulletList = () => {
    execCommand("insertUnorderedList");
  };

  const handleFontChange = (font: string) => {
    if (onFontChange) {
      onFontChange(font);
    }
    execCommand("fontName", font);
  };

  const handleFontSizeChange = (size: string) => {
    if (onFontSizeChange) {
      onFontSizeChange(size);
    }
    // Using span with inline style for precise font size control
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement("span");
        span.style.fontSize = `${size}px`;
        range.surroundContents(span);
      }
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMobile && editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Keep cursor within editor bounds
      const boundedX = Math.max(0, Math.min(x, rect.width));
      const boundedY = Math.max(0, Math.min(y, rect.height));
      
      setCursorPosition({
        x: boundedX,
        y: boundedY,
      });
    }
  }, [isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setShowCursor(true);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    setShowCursor(false);
  }, []);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Toolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onBulletList={handleBulletList}
        onFontChange={handleFontChange}
        onFontSizeChange={handleFontSizeChange}
        isBold={isBold}
        isItalic={isItalic}
        isUnderline={isUnderline}
        currentFont={currentFont}
        currentFontSize={currentFontSize}
        isMobile={isMobile}
      />
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          className={cn(
            "glass-strong rounded-lg p-6 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xl",
            "prose prose-sm md:prose-base max-w-none",
            "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
            isMobile ? "text-base min-h-[calc(100vh-280px)]" : "min-h-[calc(100vh-300px)] cursor-none"
          )}
          style={{ fontFamily: currentFont, fontSize: `${currentFontSize}px` }}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyUp={updateFormatState}
          onMouseUp={updateFormatState}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          suppressContentEditableWarning
        />
        {/* Custom Cursor */}
        {!isMobile && showCursor && username && (
          <div
            ref={cursorRef}
            className="pointer-events-none absolute z-50"
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
              transform: 'translate(-2px, -12px)',
              transition: 'left 0.05s ease-out, top 0.05s ease-out',
            }}
          >
            <div className="relative flex items-start gap-2">
              {/* I-beam cursor */}
              <svg
                width="16"
                height="24"
                viewBox="0 0 16 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                {/* Top horizontal bar */}
                <line x1="3" y1="2" x2="13" y2="2" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"/>
                {/* Vertical line */}
                <line x1="8" y1="2" x2="8" y2="22" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"/>
                {/* Bottom horizontal bar */}
                <line x1="3" y1="22" x2="13" y2="22" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              {/* Username label */}
              <div className="glass-strong rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap shadow-lg border border-primary/30 mt-0">
                {username}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
