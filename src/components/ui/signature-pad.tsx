import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  value?: string;
  onChange?: (dataUrl: string) => void;
  height?: number;
  width?: string;
  disabled?: boolean;
  placeholder?: string;
  clearButtonLabel?: string;
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
  penColor?: string;
}

export function SignaturePad({
  value,
  onChange,
  height = 200,
  width = "100%",
  disabled = false,
  placeholder = "Firme aquí",
  clearButtonLabel = "Borrar",
  saveButtonLabel = "Guardar",
  cancelButtonLabel = "Cancelar",
  penColor = "white"
}: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempSignature, setTempSignature] = useState<string | undefined>(undefined);

  // Inicializar con el valor proporcionado
  useEffect(() => {
    if (value && signatureRef.current && !isEditing) {
      signatureRef.current.fromDataURL(value);
      setIsEmpty(false);
    }
  }, [value, isEditing]);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !isEmpty) {
      const dataUrl = signatureRef.current.toDataURL('image/png');
      onChange?.(dataUrl);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (signatureRef.current && value) {
      signatureRef.current.fromDataURL(value);
      setIsEmpty(false);
    } else if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleEdit = () => {
    if (value) {
      setTempSignature(value);
    }
    setIsEditing(true);
  };

  return (
    <div className="space-y-2">
      <div 
        className={cn(
          "border rounded-md overflow-hidden",
          disabled && !isEditing && "opacity-70 cursor-not-allowed"
        )}
        style={{ height: `${height}px`, width }}
      >
        {!isEditing && value && !disabled ? (
          <div className="relative h-full">
            <img 
              src={value} 
              alt="Firma" 
              className="w-full h-full object-contain bg-black"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={handleEdit}
            >
              Editar
            </Button>
          </div>
        ) : (
          <div className="relative h-full bg-black">
            <SignatureCanvas
              ref={signatureRef}
              penColor={penColor}
              canvasProps={{
                className: "w-full h-full cursor-crosshair",
                style: { width: "100%", height: "100%" }
              }}
              onBegin={handleBegin}
              clearOnResize={false}
              backgroundColor="rgba(0,0,0,0)"
            />
            {isEmpty && !disabled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground text-sm">{placeholder}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!disabled && (isEditing || !value) && (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isEmpty}
          >
            {clearButtonLabel}
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              {cancelButtonLabel}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isEmpty}
          >
            {saveButtonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}