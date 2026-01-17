import { useRef, useState, useEffect, useCallback } from "react";
import { Toolbar } from "./Toolbar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { sanitizeRichText } from "@/lib/sanitizeRichText";

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export function TextEditor({ content, onChange, className }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentFontSize, setCurrentFontSize] = useState("16");

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
    setCurrentFont(font);
    execCommand("fontName", font);
  };

  const handleFontSizeChange = (size: string) => {
    setCurrentFontSize(size);
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
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "glass-strong min-h-[400px] md:min-h-[600px] rounded-lg p-6 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xl",
          "prose prose-sm md:prose-base max-w-none",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
          isMobile ? "text-base" : ""
        )}
        style={{ fontFamily: currentFont, fontSize: `${currentFontSize}px` }}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={updateFormatState}
        onMouseUp={updateFormatState}
        suppressContentEditableWarning
      />
    </div>
  );
}
