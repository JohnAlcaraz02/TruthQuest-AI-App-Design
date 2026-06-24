import { useCallback } from "react";
import { Upload } from "lucide-react";

export type ImageUploadZoneProps = {
  value?: string | null;
  onChange: (preview: string | null) => void;
};

export default function ImageUploadZone({ value, onChange }: ImageUploadZoneProps) {
  const onRemove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onChange(null);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-slate-200 bg-white p-10 text-center">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-4">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
              onChange(null);
              return;
            }
            const reader = new FileReader();
            reader.onload = () => onChange(reader.result as string);
            reader.onerror = () => onChange(null);
            reader.readAsDataURL(file);
          }}
        />
        {value ? (
          <img
            src={value}
            alt="Uploaded preview"
            className="max-h-64 rounded-md object-contain"
          />
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">Drop image here or click to upload</p>
              <p className="mt-1 text-sm text-muted-foreground">Supports PNG, JPG, WebP (max 10MB)</p>
            </div>
          </>
        )}
      </label>

      {value && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Remove image
        </button>
      )}
    </div>
  );
}
