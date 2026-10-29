"use client";

import * as React from "react";
import { UploadCloud, X, Plus, FileText } from "lucide-react";
import { Badge } from "../badge";
import { Spinner } from "../../ui/spinner";
import { cn } from "../../../lib/utils";

export interface FileUploadProps {
  /** Optional ref forwarded to the root container */
  ref?: React.Ref<HTMLDivElement>;
  /** Controlled value of uploaded files */
  value?: File[];
  /** Default files for uncontrolled usage */
  defaultValue?: File[];
  /** Callback fired when the list of files changes */
  onFilesChange?: (files: File[]) => void;
  /** Maximum number of files allowed (if 1, behaves as single file upload; defaults to 1) */
  maxFiles?: number;
  /** Regex pattern to validate file name / extension (e.g. /\.(jpg|jpeg|png|webp)$/i) */
  acceptRegex?: RegExp;
  /** Maximum allowed file size in bytes */
  maxFileSize?: number;
  /** Native accept attribute for file picker filter (e.g. ".pdf", "image/*", "application/pdf") */
  accept?: string;
  /** Explicit flag to allow multiple files (defaults to maxFiles > 1) */
  multiple?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether files are currently uploading */
  loading?: boolean;
  /** Whether a file selection is required */
  required?: boolean;
  /** Custom label displayed above the upload area */
  label?: string;
  /** Error message displayed below the dropzone */
  error?: string;
  /** Helper text displayed below the files */
  helperText?: string;
  /** Custom main text inside the dropzone */
  dropzoneTitle?: string;
  /** Custom subtitle text inside the dropzone */
  dropzoneSubtitle?: string;
  /** Additional className for the root container */
  className?: string;
  /** ID for the native input element */
  id?: string;
  /** Name attribute for the native input */
  name?: string;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${formatted} ${sizes[i]}`;
}

const globalFileUrlCache = new WeakMap<object, string>();

export function isImageFile(file: any): boolean {
  if (!file) return false;
  if (typeof file === "string") {
    return /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file);
  }
  if (typeof file.url === "string") {
    return true;
  }
  return (
    (Boolean(file.type) && file.type.startsWith("image/")) ||
    Boolean(file.name && /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name))
  );
}

export function getFilePreviewUrl(file: any): string {
  if (!file) return "";
  if (typeof file === "string") return file;
  if (typeof file.url === "string") return file.url;
  if (typeof file.preview === "string") return file.preview;

  if (
    typeof window === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return "";
  }

  if (typeof file === "object" && file !== null) {
    let url = globalFileUrlCache.get(file);
    if (!url) {
      try {
        url = URL.createObjectURL(file as Blob);
        globalFileUrlCache.set(file, url);
      } catch {
        return "";
      }
    }
    return url;
  }

  return "";
}

export function revokeFilePreviewUrl(file: any): void {
  if (typeof file === "object" && file !== null) {
    const url = globalFileUrlCache.get(file);
    if (url) {
      if (
        typeof URL !== "undefined" &&
        typeof URL.revokeObjectURL === "function"
      ) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore
        }
      }
      globalFileUrlCache.delete(file);
    }
  }
}

export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || !accept.trim()) return true;

  const patterns = accept
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (patterns.length === 0) return true;

  const fileName = file.name.toLowerCase();
  const fileType = (file.type || "").toLowerCase();

  return patterns.some((pattern) => {
    // Extension match, e.g. ".pdf", ".docx", ".png"
    if (pattern.startsWith(".")) {
      return fileName.endsWith(pattern);
    }
    // Wildcard MIME match, e.g. "image/*", "audio/*"
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1);
      return fileType.startsWith(prefix);
    }
    // Exact MIME match, e.g. "application/pdf"
    return fileType === pattern;
  });
}

export function FileUpload({
  ref,
  value,
  defaultValue,
  onFilesChange,
  maxFiles = 1,
  acceptRegex,
  maxFileSize,
  accept,
  multiple,
  disabled = false,
  loading = false,
  required = false,
  label,
  error,
  helperText,
  dropzoneTitle,
  dropzoneSubtitle,
  className,
  id,
  name,
}: FileUploadProps) {
  const inputId = id ?? React.useId();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Determine multiple mode
  const isMultiple = maxFiles > 1 || multiple === true;
  const effectiveMaxFiles = maxFiles;

  // Uncontrolled state fallback
  const [internalFiles, setInternalFiles] = React.useState<File[]>(
    defaultValue ?? [],
  );
  const files = value !== undefined ? value : internalFiles;

  // Stable deterministic keys for File items to avoid React re-mounting cards on reorder or step change
  const getFileKey = React.useCallback((file: any, index: number) => {
    if (file.id) return file.id;
    return `${file.name || "file"}-${file.size || 0}-${file.lastModified || index}`;
  }, []);

  // UI state
  const [isDragging, setIsDragging] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const isMaxReached = files.length >= effectiveMaxFiles;
  const isInactive = disabled || loading || isMaxReached;

  const commitFiles = React.useCallback(
    (nextFiles: File[]) => {
      if (value === undefined) {
        setInternalFiles(nextFiles);
      }
      onFilesChange?.(nextFiles);
    },
    [value, onFilesChange],
  );

  const validateAndAddFiles = React.useCallback(
    (incomingFiles: FileList | File[]) => {
      if (disabled || loading) return;

      const incomingList = Array.from(incomingFiles);
      if (incomingList.length === 0) return;

      const newErrors: string[] = [];
      const currentCount = files.length;
      const availableSlots = effectiveMaxFiles - currentCount;

      if (availableSlots <= 0) {
        setErrors([
          `Maximum of ${effectiveMaxFiles} ${effectiveMaxFiles === 1 ? "file" : "files"} allowed.`,
        ]);
        return;
      }

      const validCandidates: File[] = [];

      incomingList.forEach((file) => {
        // 1. Check native accept pattern (MIME type or file extension)
        if (accept && !matchesAccept(file, accept)) {
          newErrors.push(`${file.name} is not a supported file type.`);
          return;
        }

        // 2. Check regex file pattern (e.g. /\.(pdf|doc|docx)$/i)
        if (acceptRegex) {
          acceptRegex.lastIndex = 0;
          if (!acceptRegex.test(file.name)) {
            newErrors.push(`${file.name} is not a supported file type.`);
            return;
          }
        }

        // 3. Check file size
        if (maxFileSize && file.size > maxFileSize) {
          newErrors.push(
            `${file.name} exceeds the maximum file size of ${formatFileSize(maxFileSize)}.`,
          );
          return;
        }

        validCandidates.push(file);
      });

      // Limit to available slots
      let acceptedFiles: File[];
      if (validCandidates.length > availableSlots) {
        newErrors.push(
          `Maximum of ${effectiveMaxFiles} ${effectiveMaxFiles === 1 ? "file" : "files"} allowed. Only first ${availableSlots} valid ${availableSlots === 1 ? "file was" : "files were"} added.`,
        );
        acceptedFiles = validCandidates.slice(0, availableSlots);
      } else {
        acceptedFiles = validCandidates;
      }

      setErrors(newErrors);

      if (acceptedFiles.length > 0) {
        if (isMultiple) {
          commitFiles([...files, ...acceptedFiles]);
        } else {
          commitFiles(acceptedFiles.slice(0, 1));
        }
      }

      // Reset native input value so same file can be selected again if removed
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [
      disabled,
      loading,
      files,
      effectiveMaxFiles,
      accept,
      acceptRegex,
      maxFileSize,
      isMultiple,
      commitFiles,
    ],
  );

  const handleRemove = React.useCallback(
    (indexToRemove: number) => {
      if (disabled || loading) return;
      const fileToRemove = files[indexToRemove];
      if (fileToRemove) {
        revokeFilePreviewUrl(fileToRemove);
      }
      const nextFiles = files.filter((_, i) => i !== indexToRemove);
      commitFiles(nextFiles);
      setErrors([]);
    },
    [disabled, loading, files, commitFiles],
  );

  const handleBrowseClick = () => {
    if (isInactive) return;
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
    }
  };

  // Dropzone drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInactive) return;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInactive) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isInactive) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  // Card reordering drag events
  const handleCardDragStart = (e: React.DragEvent, index: number) => {
    if (disabled || loading || !isMultiple) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    if (disabled || loading || !isMultiple) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCardDrop = (e: React.DragEvent, targetIndex: number) => {
    if (disabled || loading || !isMultiple) return;
    e.preventDefault();
    e.stopPropagation();

    // If user dropped an external file from desktop onto a card
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const fromData = e.dataTransfer.getData("text/plain");
    const fromIndex =
      draggedIndex ?? (fromData ? parseInt(fromData, 10) : null);

    if (
      fromIndex !== null &&
      !isNaN(fromIndex) &&
      fromIndex !== targetIndex &&
      fromIndex >= 0 &&
      fromIndex < files.length &&
      targetIndex >= 0 &&
      targetIndex < files.length
    ) {
      const reordered = [...files];
      const [movedItem] = reordered.splice(fromIndex, 1);
      if (movedItem) {
        reordered.splice(targetIndex, 0, movedItem);
        commitFiles(reordered);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCardDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Subtitle text calculation
  const defaultSubtitle = React.useMemo(() => {
    if (loading) {
      return "Please wait while files are uploading.";
    }
    if (isMaxReached) {
      return `Maximum of ${effectiveMaxFiles} ${effectiveMaxFiles === 1 ? "file" : "files"} reached.`;
    }
    const countMsg = `Up to ${effectiveMaxFiles} ${effectiveMaxFiles === 1 ? "file" : "files"}.`;
    if (maxFileSize) {
      return `${countMsg} Max size ${formatFileSize(maxFileSize)}.`;
    }
    return countMsg;
  }, [loading, isMaxReached, effectiveMaxFiles, maxFileSize]);

  return (
    <div ref={ref} className={cn("w-full font-sans", className)}>
      {/* Optional Form Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-foreground select-none"
        >
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        data-testid="file-upload-input"
        accept={accept}
        multiple={isMultiple}
        disabled={disabled || loading || isMaxReached}
        required={required && files.length === 0}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Dropzone Area */}
      <div
        role="button"
        tabIndex={isInactive ? -1 : 0}
        aria-label="Upload files"
        aria-disabled={isInactive}
        aria-invalid={Boolean(error) || errors.length > 0 ? true : undefined}
        data-dropzone="true"
        onClick={handleBrowseClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleBrowseClick();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center transition-colors outline-none",
          "bg-muted/30 border-border hover:bg-muted/50 hover:border-gray-900 focus-visible:border-gray-900 focus-visible:outline-none dark:hover:border-white dark:focus-visible:border-white",
          isDragging && "border-primary bg-accent/40",
          (Boolean(error) || errors.length > 0) && "border-red-600 bg-red-50/20",
          isInactive &&
            "cursor-not-allowed opacity-60 hover:bg-muted/30 hover:border-border",
          !isInactive && "cursor-pointer",
        )}
      >
        {loading ? (
          <Spinner className="size-8 text-primary mb-2" />
        ) : (
          <UploadCloud className="size-10 text-muted-foreground mb-2 stroke-1" />
        )}

        <p className="text-sm font-semibold text-foreground">
          {loading
            ? "Uploading..."
            : (dropzoneTitle ??
              (isMaxReached
                ? `Maximum of ${effectiveMaxFiles} ${effectiveMaxFiles === 1 ? "file" : "files"} reached`
                : "Drag and drop photos here or click to browse"))}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {dropzoneSubtitle ?? defaultSubtitle}
        </p>
      </div>

      {/* Validation Error Text */}
      {(Boolean(error) || errors.length > 0) && (
        <div role="alert" className="mt-1.5 space-y-1">
          {error && (
            <p className="text-xs font-medium text-red-600">{error}</p>
          )}
          {errors.map((err, i) => (
            <p key={i} className="text-xs font-medium text-red-600">{err}</p>
          ))}
        </div>
      )}

      {/* Uploaded Files Review Area */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Uploaded files</span>
            <span>
              {files.length} of {effectiveMaxFiles}{" "}
              {effectiveMaxFiles === 1 ? "file" : "files"} uploaded
            </span>
          </div>

          {/* Files Grid (matching Trusted Marketplace card visual) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {files.map((file, index) => {
              const isImage = isImageFile(file);
              const previewUrl = isImage ? getFilePreviewUrl(file) : "";
              const isCover = index === 0;
              const isBeingDragged = draggedIndex === index;
              const isDropTarget =
                dragOverIndex === index && draggedIndex !== index;

              return (
                <div
                  key={getFileKey(file, index)}
                  draggable={!disabled && !loading && isMultiple}
                  onDragStart={(e) => handleCardDragStart(e, index)}
                  onDragOver={(e) => handleCardDragOver(e, index)}
                  onDragLeave={handleCardDragLeave}
                  onDrop={(e) => handleCardDrop(e, index)}
                  onDragEnd={handleCardDragEnd}
                  className={cn(
                    "group relative aspect-square rounded border border-border bg-muted/20 overflow-hidden transition-all shadow-2xs",
                    isBeingDragged && "opacity-40 scale-95 border-primary",
                    isDropTarget &&
                      "ring-2 ring-primary ring-offset-2 border-primary scale-105",
                    !disabled &&
                      !loading &&
                      isMultiple &&
                      "cursor-grab active:cursor-grabbing",
                  )}
                >
                  {/* Primary Cover Badge on First Image */}
                  {isCover && (
                    <Badge
                      variant="default"
                      className="absolute top-2 left-2 z-10 text-xs font-bold uppercase tracking-wider bg-foreground text-background shadow-xs pointer-events-none"
                    >
                      COVER
                    </Badge>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    disabled={disabled || loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className={cn(
                      "absolute top-2 right-2 z-10 size-7 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center text-foreground hover:text-destructive shadow-xs transition-colors cursor-pointer",
                      (disabled || loading) && "pointer-events-none opacity-50",
                    )}
                  >
                    <X className="size-4" />
                  </button>

                  {/* Preview Content */}
                  {isImage && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={file.name}
                      onError={(e) => {
                        try {
                          if (file instanceof Blob && typeof URL !== "undefined") {
                            const fresh = URL.createObjectURL(file);
                            globalFileUrlCache.set(file, fresh);
                            (e.target as HTMLImageElement).src = fresh;
                          }
                        } catch {
                          // Ignore
                        }
                      }}
                      className="h-full w-full object-cover select-none pointer-events-none"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center select-none">
                      <FileText className="size-8 text-muted-foreground mb-2 shrink-0" />
                      <p className="w-full truncate text-xs font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  )}

                  {/* Bottom Metadata Overlay for Images */}
                  {isImage && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-linear-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="truncate text-xs font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-white/80">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* "Add More" Button Card (if capacity allows and not disabled/loading) */}
            {!isMaxReached && !disabled && !loading && (
              <button
                type="button"
                onClick={handleBrowseClick}
                aria-label="Add more files"
                className="aspect-square rounded border-2 border-dashed border-border hover:border-gray-900 hover:bg-muted/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:border-gray-900 dark:hover:border-white dark:focus-visible:border-white"
              >
                <Plus className="size-6" />
                <span className="text-xs font-medium">Add More</span>
              </button>
            )}
          </div>

          {/* Helper text below preview grid */}
          {helperText && (
            <p className="mt-3 text-xs text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
