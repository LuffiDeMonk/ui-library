"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";
import { Label } from "../label";
import { Tooltip } from "../tooltip";
import { Select, type SelectOption } from "../select";
import { cn } from "../../../lib/utils";

export const DEFAULT_FONT_SIZE_OPTIONS: SelectOption[] = [
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
  { label: "14", value: "14" },
  { label: "16", value: "16" },
  { label: "18", value: "18" },
  { label: "20", value: "20" },
  { label: "22", value: "22" },
  { label: "24", value: "24" },
  { label: "26", value: "26" },
  { label: "28", value: "28" },
  { label: "30", value: "30" },
  { label: "36", value: "36" },
  { label: "48", value: "48" },
  { label: "72", value: "72" },
];

export interface TextEditorProps {
  /**
   * Ref for the contentEditable element. Standard React 19 prop.
   */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Label text rendered above the editor.
   */
  label?: string;
  /**
   * Value can be a Base64-encoded HTML string or raw HTML string.
   */
  value?: string;
  /**
   * Default value for uncontrolled usage (Base64 string or HTML string).
   */
  defaultValue?: string;
  /**
   * Primary callback when editor content changes.
   * Provides the base64-encoded HTML as first argument, raw HTML as second, and plain text as third.
   */
  onChange?: (
    base64Value: string,
    htmlValue: string,
    plainText: string,
  ) => void;
  /**
   * Placeholder text displayed when the editor is empty.
   */
  placeholder?: string;
  /**
   * Whether the editor is disabled / read-only.
   */
  disabled?: boolean;
  /**
   * Error message displayed below the editor. Also applies the red border state.
   */
  error?: string;
  /**
   * Helper text displayed below the editor when there is no error.
   */
  helperText?: string;
  /**
   * Font size options available in the toolbar selector. Defaults to MS Word standard sizes (8 to 72).
   */
  fontSizeOptions?: SelectOption[];
  /**
   * Minimum height of the editable text area. Defaults to 140.
   */
  minHeight?: number | string;
  /**
   * Additional className for the outer container.
   */
  className?: string;
  /**
   * Additional className for the editor border wrapper.
   */
  wrapperClassName?: string;
  /**
   * Additional className for the editable content area.
   */
  editorClassName?: string;
  /**
   * Additional className for the toolbar container.
   */
  toolbarClassName?: string;
  /**
   * HTML id for accessibility associations.
   */
  id?: string;
}

/**
 * Checks whether an HTML or Base64 string represents an empty editor content.
 */
export function isEditorEmpty(content?: string): boolean {
  if (!content) return true;
  const decoded = decodeFromBase64(content);
  const plainText = decoded
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return plainText.length === 0;
}

/**
 * Converts a UTF-8 string/HTML to Base64 format.
 * Works seamlessly in both browser and Node/SSR environments.
 */
export function encodeToBase64(str: string): string {
  if (!str) return "";
  try {
    const nodeBuffer = (
      globalThis as unknown as {
        Buffer?: {
          from(
            str: string,
            encoding?: string
          ): { toString(encoding?: string): string };
        };
      }
    ).Buffer;
    if (typeof nodeBuffer !== "undefined") {
      return nodeBuffer.from(str, "utf-8").toString("base64");
    }
    if (typeof window !== "undefined") {
      return window.btoa(unescape(encodeURIComponent(str)));
    }
  } catch {
    // Fallback if encoding fails
  }
  return "";
}

/**
 * Decodes a Base64 string to HTML.
 * If the input is already HTML or not base64, returns it as-is.
 */
export function decodeFromBase64(str?: string): string {
  if (!str) return "";
  if (/<[a-z][\s\S]*>/i.test(str)) {
    return str;
  }
  try {
    const nodeBuffer = (
      globalThis as unknown as {
        Buffer?: {
          from(
            str: string,
            encoding?: string
          ): { toString(encoding?: string): string };
        };
      }
    ).Buffer;
    if (typeof nodeBuffer !== "undefined") {
      const decoded = nodeBuffer.from(str, "base64").toString("utf-8");
      if (decoded) return decoded;
    }
    if (typeof window !== "undefined") {
      return decodeURIComponent(escape(window.atob(str)));
    }
  } catch {
    return str;
  }
  return str;
}

export function TextEditor({
  ref,
  label,
  value,
  defaultValue = "",
  onChange,
  placeholder = "Write your content here...",
  disabled = false,
  error,
  helperText,
  fontSizeOptions = DEFAULT_FONT_SIZE_OPTIONS,
  minHeight = 140,
  className,
  wrapperClassName,
  editorClassName,
  toolbarClassName,
  id,
}: TextEditorProps) {
  const generatedId = React.useId();
  const editorId = id ?? generatedId;
  const errorId = error ? `${editorId}-error` : undefined;
  const helperId = helperText ? `${editorId}-helper` : undefined;

  const contentRef = React.useRef<HTMLDivElement>(null);
  const lastEmittedHtmlRef = React.useRef<string>("");
  const lastEmittedBase64Ref = React.useRef<string>("");
  const isInitialMountRef = React.useRef<boolean>(true);
  const savedRangeRef = React.useRef<Range>(null);

  // Synchronize ref with forwarded ref
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  const [currentFontSize, setCurrentFontSize] = React.useState<string>("14");
  const [activeFormats, setActiveFormats] = React.useState<
    Record<string, boolean>
  >({});
  const [showLinkInput, setShowLinkInput] = React.useState<boolean>(false);
  const [linkUrl, setLinkUrl] = React.useState<string>("");

  const saveCurrentSelection = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && contentRef.current) {
      const range = sel.getRangeAt(0);
      if (contentRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const onSelectionChange = () => {
      saveCurrentSelection();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [saveCurrentSelection]);

  const initialContent = value !== undefined ? value : defaultValue;
  const [isEmpty, setIsEmpty] = React.useState<boolean>(() =>
    isEditorEmpty(initialContent),
  );

  // Initialize DOM innerHTML on initial mount
  React.useEffect(() => {
    if (!contentRef.current) return;
    const initialRaw = value !== undefined ? value : defaultValue;
    if (initialRaw) {
      const decoded = decodeFromBase64(initialRaw);
      contentRef.current.innerHTML = decoded;
      lastEmittedHtmlRef.current = decoded;
      lastEmittedBase64Ref.current = encodeToBase64(decoded);
      setIsEmpty(isEditorEmpty(decoded));
    }
    isInitialMountRef.current = false;
  }, []); // Run once on mount

  // Synchronize external value changes only when value differs from what was typed internally
  React.useEffect(() => {
    if (isInitialMountRef.current) return;
    if (!contentRef.current) return;

    // If value matches what was emitted by typing, do NOT modify the DOM (prevents cursor jump and text deletion)
    if (
      value === lastEmittedBase64Ref.current ||
      value === lastEmittedHtmlRef.current
    ) {
      return;
    }

    // External reset or prop change
    const targetHtml = decodeFromBase64(value || "");
    if (contentRef.current.innerHTML !== targetHtml) {
      contentRef.current.innerHTML = targetHtml;
      lastEmittedHtmlRef.current = targetHtml;
      lastEmittedBase64Ref.current = encodeToBase64(targetHtml);
      setIsEmpty(isEditorEmpty(targetHtml));
    }
  }, [value]);

  // Check which formatting commands are active and detect current font size
  const updateActiveFormats = React.useCallback(() => {
    if (typeof document === "undefined" || disabled) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikethrough: document.queryCommandState("strikeThrough"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });

      // Detect font size at current cursor / selection
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && contentRef.current) {
        let node: Node | null = sel.anchorNode;
        if (node && node.nodeType === Node.TEXT_NODE) {
          node = node.parentElement;
        }
        if (node && contentRef.current.contains(node)) {
          let currentEl: HTMLElement | null = node as HTMLElement;
          let detectedSize: string | null = null;
          while (currentEl && currentEl !== contentRef.current) {
            if (currentEl.style?.fontSize) {
              const numericMatch =
                currentEl.style.fontSize.match(/\d+(\.\d+)?/);
              if (numericMatch) {
                detectedSize = Math.round(
                  parseFloat(numericMatch[0]),
                ).toString();
                break;
              }
            }
            currentEl = currentEl.parentElement;
          }
          if (detectedSize) {
            setCurrentFontSize(detectedSize);
          } else {
            setCurrentFontSize("14");
          }
        }
      }
    } catch {
      // Ignore if document selection is unavailable
    }
  }, [disabled]);

  const handleFontSizeChange = (size: string | null) => {
    if (!size || disabled || typeof document === "undefined") return;

    contentRef.current?.focus();

    // Restore saved selection if available
    const selection = window.getSelection();
    if (selection && savedRangeRef.current) {
      try {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      } catch {
        // Ignore range restore errors
      }
    }

    const activeSel = window.getSelection();
    if (!activeSel || activeSel.rangeCount === 0 || !contentRef.current) {
      setCurrentFontSize(size);
      return;
    }

    const range = activeSel.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      setCurrentFontSize(size);
      return;
    }

    if (range.collapsed) {
      // Check if cursor is inside an existing font-size span
      let node: Node | null = range.startContainer;
      let existingSpan: HTMLElement | null = null;
      while (node && node !== contentRef.current) {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          (node as HTMLElement).tagName === "SPAN" &&
          (node as HTMLElement).style.fontSize
        ) {
          existingSpan = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }

      if (existingSpan) {
        existingSpan.style.fontSize = `${size}px`;
      } else {
        const span = document.createElement("span");
        span.style.fontSize = `${size}px`;
        const zeroWidthSpace = document.createTextNode("\u200B");
        span.appendChild(zeroWidthSpace);
        range.insertNode(span);

        // Move cursor inside the span after the zero-width space
        const newRange = document.createRange();
        newRange.setStart(zeroWidthSpace, 1);
        newRange.setEnd(zeroWidthSpace, 1);
        activeSel.removeAllRanges();
        activeSel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      }
    } else {
      // Apply font size using standard execCommand marker
      try {
        document.execCommand("fontSize", false, "7");
      } catch {
        // Fallback for environments where execCommand is disabled
      }

      const fontElements =
        contentRef.current.querySelectorAll('font[size="7"]');
      if (fontElements.length > 0) {
        fontElements.forEach((fontEl) => {
          const parent = fontEl.parentElement;
          if (
            parent &&
            parent.tagName === "SPAN" &&
            parent.style.fontSize &&
            parent.childNodes.length === 1
          ) {
            parent.style.fontSize = `${size}px`;
            parent.innerHTML = fontEl.innerHTML;
          } else {
            const span = document.createElement("span");
            span.style.fontSize = `${size}px`;
            span.innerHTML = fontEl.innerHTML;
            fontEl.parentNode?.replaceChild(span, fontEl);
          }
        });
      } else {
        // Fallback for headless environments (JSDOM)
        try {
          const fragment = range.extractContents();
          const span = document.createElement("span");
          span.style.fontSize = `${size}px`;
          span.appendChild(fragment);
          range.insertNode(span);
        } catch {
          // Ignore
        }
      }

      if (activeSel.rangeCount > 0) {
        savedRangeRef.current = activeSel.getRangeAt(0).cloneRange();
      }
    }

    setCurrentFontSize(size);
    handleContentChange();
    updateActiveFormats();
  };

  const executeCommand = (
    command: string,
    arg: string | undefined = undefined,
  ) => {
    if (disabled || typeof document === "undefined") return;
    contentRef.current?.focus();
    try {
      document.execCommand(command, false, arg);
    } catch {
      // Ignore if unsupported
    }
    if (command === "removeFormat") {
      if (contentRef.current) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const spans = contentRef.current.querySelectorAll(
            "span[style*='font-size']",
          );
          spans.forEach((span) => {
            if (range.intersectsNode(span)) {
              (span as HTMLElement).style.fontSize = "";
            }
          });
        }
      }
      setCurrentFontSize("14");
    }
    handleContentChange();
    updateActiveFormats();
  };

  const handleContentChange = () => {
    if (!contentRef.current) return;

    const htmlContent = contentRef.current.innerHTML;
    const plainText =
      contentRef.current.innerText || contentRef.current.textContent || "";
    const base64Value = encodeToBase64(htmlContent);

    lastEmittedHtmlRef.current = htmlContent;
    lastEmittedBase64Ref.current = base64Value;
    setIsEmpty(plainText.trim().length === 0);

    onChange?.(base64Value, htmlContent, plainText);
  };

  const handleApplyLink = () => {
    if (linkUrl.trim()) {
      const formattedUrl = /^https?:\/\//i.test(linkUrl.trim())
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`;
      executeCommand("createLink", formattedUrl);
    }
    setLinkUrl("");
    setShowLinkInput(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <Label htmlFor={editorId} className="mb-2 block">
          {label}
        </Label>
      )}

      {/* Editor Box */}
      <div
        className={cn(
          "rounded border bg-white transition-colors overflow-hidden dark:bg-gray-900",
          error
            ? "border-red-600 focus-within:border-red-600"
            : "border-gray-300 focus-within:border-gray-900 dark:border-gray-700 dark:focus-within:border-white",
          disabled &&
            "opacity-60 bg-gray-50 cursor-not-allowed dark:bg-gray-800/40",
          wrapperClassName,
        )}
      >
        {/* Toolbar */}
        <div
          role="toolbar"
          aria-label="Text formatting"
          className={cn(
            "flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/80 p-2 select-none dark:border-gray-800 dark:bg-gray-850",
            disabled && "pointer-events-none opacity-50",
            toolbarClassName,
          )}
        >
          {/* Font Size Select (MS Word style) */}
          <Tooltip title="Font Size" placement="top">
            <div
              className="w-18 shrink-0"
              onMouseDown={saveCurrentSelection}
              role="group"
              aria-label="Font size selector"
            >
              <Select
                options={fontSizeOptions}
                value={currentFontSize}
                onValueChange={handleFontSizeChange}
                placeholder="14"
                className="h-7 min-h-7 px-2 py-0 text-xs bg-white dark:bg-gray-800"
                disabled={disabled}
              />
            </div>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

          {/* Inline styles */}
          <Tooltip title="Bold" placement="top">
            <button
              type="button"
              aria-label="Bold"
              aria-pressed={activeFormats.bold}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("bold");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.bold &&
                  "bg-gray-200 font-bold text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Italic" placement="top">
            <button
              type="button"
              aria-label="Italic"
              aria-pressed={activeFormats.italic}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("italic");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.italic &&
                  "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Underline" placement="top">
            <button
              type="button"
              aria-label="Underline"
              aria-pressed={activeFormats.underline}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("underline");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.underline &&
                  "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Strikethrough" placement="top">
            <button
              type="button"
              aria-label="Strikethrough"
              aria-pressed={activeFormats.strikethrough}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("strikeThrough");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.strikethrough &&
                  "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Code / Monospace" placement="top">
            <button
              type="button"
              aria-label="Code block"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("formatBlock", "<pre>");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

          {/* Headings */}
          <Tooltip title="Heading 1" placement="top">
            <button
              type="button"
              aria-label="Heading 1"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("formatBlock", "<h1>");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Heading1 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Heading 2" placement="top">
            <button
              type="button"
              aria-label="Heading 2"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("formatBlock", "<h2>");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Heading2 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Heading 3" placement="top">
            <button
              type="button"
              aria-label="Heading 3"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("formatBlock", "<h3>");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Heading3 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Blockquote" placement="top">
            <button
              type="button"
              aria-label="Blockquote"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("formatBlock", "<blockquote>");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

          {/* Lists */}
          <Tooltip title="Bullet List" placement="top">
            <button
              type="button"
              aria-label="Bullet list"
              aria-pressed={activeFormats.unorderedList}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("insertUnorderedList");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.unorderedList &&
                  "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Numbered List" placement="top">
            <button
              type="button"
              aria-label="Numbered list"
              aria-pressed={activeFormats.orderedList}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("insertOrderedList");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.orderedList &&
                  "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

          {/* Alignment */}
          <Tooltip title="Align Left" placement="top">
            <button
              type="button"
              aria-label="Align left"
              aria-pressed={activeFormats.justifyLeft}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("justifyLeft");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.justifyLeft &&
                  "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Align Center" placement="top">
            <button
              type="button"
              aria-label="Align center"
              aria-pressed={activeFormats.justifyCenter}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("justifyCenter");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.justifyCenter &&
                  "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Align Right" placement="top">
            <button
              type="button"
              aria-label="Align right"
              aria-pressed={activeFormats.justifyRight}
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("justifyRight");
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                activeFormats.justifyRight &&
                  "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
              )}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

          {/* Links */}
          <Tooltip title="Insert Link" placement="top">
            <button
              type="button"
              aria-label="Insert link"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowLinkInput((prev) => !prev);
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Remove Link" placement="top">
            <button
              type="button"
              aria-label="Remove link"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("unlink");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

          {/* Undo / Redo / Clear */}
          <Tooltip title="Undo" placement="top">
            <button
              type="button"
              aria-label="Undo"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("undo");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Undo className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Redo" placement="top">
            <button
              type="button"
              aria-label="Redo"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("redo");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <Redo className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Clear Formatting" placement="top">
            <button
              type="button"
              aria-label="Clear formatting"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("removeFormat");
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <RemoveFormatting className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>

        {/* Link Input Drawer */}
        {showLinkInput && (
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100/60 p-2 dark:border-gray-800 dark:bg-gray-800">
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyLink();
                }
              }}
              className="h-8 flex-1 rounded border border-gray-300 bg-white px-2 text-xs outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-white"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="h-8 rounded bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 cursor-pointer"
            >
              Add Link
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ContentEditable Editor Surface */}
        <div className="relative">
          {isEmpty && (
            <div className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4 text-sm text-gray-400 select-none">
              {placeholder}
            </div>
          )}
          <div
            ref={contentRef}
            id={editorId}
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={handleContentChange}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(" ") || undefined
            }
            role="textbox"
            aria-multiline="true"
            aria-placeholder={placeholder}
            data-placeholder={placeholder}
            style={{ minHeight }}
            className={cn(
              "p-3 sm:p-4 text-sm text-gray-900 dark:text-gray-100 outline-none leading-relaxed overflow-y-auto",
              "prose prose-sm dark:prose-invert max-w-none",
              "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-1",
              "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600 dark:[&_blockquote]:border-gray-700 dark:[&_blockquote]:text-gray-400",
              "[&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:font-mono [&_pre]:text-xs dark:[&_pre]:bg-gray-800",
              "[&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400",
              editorClassName,
            )}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default TextEditor;
