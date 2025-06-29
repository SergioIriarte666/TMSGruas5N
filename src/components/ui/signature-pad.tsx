import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  className?: string;
}

export function SignaturePad({
  value,
  onChange,
  height = 200,
  width = '100%',
  disabled = false,
  placeholder = 'Firme aquí',
  clearButtonLabel = 'Limpiar',
  saveButtonLabel = 'Guardar',
  cancelButtonLabel = 'Cancelar',
  penColor = 'black',
  className,
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEditing, setIsEditing] = useState(!value);
  const [tempSignature, setTempSignature] = useState<string | null>(null);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setTempSignature(null);
    }
  };

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      setTempSignature(dataUrl);
      onChange?.(dataUrl);
      setIsEditing(false);
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setTempSignature(null);
  };

  const startEditing = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {isEditing ? (
        <>
          <div 
            className="bg-background"
            style={{ height: `${height}px`, width }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              penColor={penColor}
              canvasProps={{
                height,
                width: '100%',
                className: 'signature-canvas',
                style: { 
                  width: '100%', 
                  height: '100%',
                  backgroundColor: disabled ? '#f3f4f6' : 'white'
                }
              }}
              backgroundColor={disabled ? '#f3f4f6' : 'white'}
              clearOnResize={false}
              dotSize={1}
              minWidth={1}
              maxWidth={2.5}
              velocityFilterWeight={0.7}
            />
          </div>
          <div className="flex justify-end gap-2 p-2 border-t bg-muted">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={clear}
              disabled={disabled}
            >
              {clearButtonLabel}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={cancel}
              disabled={disabled}
            >
              {cancelButtonLabel}
            </Button>
            <Button 
              type="button" 
              size="sm" 
              onClick={save}
              disabled={disabled || (sigCanvas.current?.isEmpty() ?? true)}
            >
              {saveButtonLabel}
            </Button>
          </div>
        </>
      ) : (
        <div 
          className="flex items-center justify-center cursor-pointer"
          style={{ height: `${height}px`, width }}
          onClick={startEditing}
        >
          {value || tempSignature ? (
            <img 
              src={value || tempSignature || ''} 
              alt="Firma" 
              className="max-h-full max-w-full"
            />
          ) : (
            <div className="text-muted-foreground text-sm">{placeholder}</div>
          )}
        </div>
      )}
    </div>
  );
}