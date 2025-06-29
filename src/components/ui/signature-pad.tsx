import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
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
  className
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onChange('');
    }
  };

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      onChange(dataUrl);
      setIsSigning(false);
    }
  };

  const cancel = () => {
    setIsSigning(false);
  };

  const startSigning = () => {
    setIsSigning(true);
    // Limpiar la firma existente si hay una
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {isSigning ? (
        <>
          <div 
            className="border rounded-md overflow-hidden bg-white"
            style={{ height: `${height}px`, width }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              penColor={penColor}
              canvasProps={{
                width: '100%',
                height: height,
                className: 'signature-canvas',
                style: { width: '100%', height: '100%' }
              }}
              onBegin={() => setIsDrawing(true)}
              onEnd={() => setIsDrawing(false)}
              backgroundColor="white"
            />
          </div>
          <div className="flex justify-end gap-2">
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
              disabled={disabled || !isDrawing}
            >
              {saveButtonLabel}
            </Button>
          </div>
        </>
      ) : value ? (
        <div className="relative">
          <div 
            className="border rounded-md overflow-hidden bg-white flex items-center justify-center"
            style={{ height: `${height}px`, width }}
          >
            <img 
              src={value} 
              alt="Firma" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
          {!disabled && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="absolute top-2 right-2"
              onClick={startSigning}
            >
              Cambiar
            </Button>
          )}
        </div>
      ) : (
        <div 
          className="border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          style={{ height: `${height}px`, width }}
          onClick={disabled ? undefined : startSigning}
        >
          <p className="text-muted-foreground text-sm">{placeholder}</p>
          {!disabled && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Firmar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}