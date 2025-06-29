import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './button';
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
  penColor = '#000000',
  className
}: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSigning, setIsSigning] = useState(false);

  // Cargar firma existente si hay un valor
  useEffect(() => {
    if (value && signatureRef.current && !isSigning) {
      const img = new Image();
      img.onload = () => {
        const canvas = signatureRef.current;
        if (canvas) {
          canvas.clear();
          canvas.getCanvas().getContext('2d')?.drawImage(img, 0, 0);
          setIsEmpty(false);
        }
      };
      img.src = value;
    }
  }, [value, isSigning]);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
      onChange?.('');
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !isEmpty) {
      const dataUrl = signatureRef.current.toDataURL('image/png');
      onChange?.(dataUrl);
      setIsSigning(false);
    }
  };

  const handleCancel = () => {
    setIsSigning(false);
    if (value && signatureRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = signatureRef.current;
        if (canvas) {
          canvas.clear();
          canvas.getCanvas().getContext('2d')?.drawImage(img, 0, 0);
          setIsEmpty(false);
        }
      };
      img.src = value;
    } else {
      handleClear();
    }
  };

  const handleBegin = () => {
    setIsSigning(true);
    setIsEmpty(false);
  };

  const handleEnd = () => {
    if (signatureRef.current) {
      setIsEmpty(signatureRef.current.isEmpty());
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div 
        className={cn(
          "border rounded-md overflow-hidden bg-white", 
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-crosshair"
        )}
        style={{ height: `${height}px`, width }}
      >
        {!isSigning && value ? (
          <div className="relative h-full w-full">
            <img 
              src={value} 
              alt="Firma" 
              className="h-full w-full object-contain" 
              onClick={() => !disabled && setIsSigning(true)}
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsSigning(true)}
                >
                  Editar Firma
                </Button>
              </div>
            )}
          </div>
        ) : (
          <SignatureCanvas
            ref={signatureRef}
            penColor={penColor}
            canvasProps={{
              className: cn(
                "w-full h-full",
                disabled ? "cursor-not-allowed" : "cursor-crosshair"
              ),
              style: { width: '100%', height: '100%' }
            }}
            onBegin={handleBegin}
            onEnd={handleEnd}
            backgroundColor="white"
            clearOnResize={false}
            disabled={disabled}
          />
        )}
        
        {isEmpty && !value && !isSigning && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      
      {!disabled && isSigning && (
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleClear}
            disabled={isEmpty}
          >
            {clearButtonLabel}
          </Button>
          <div className="space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
            >
              {cancelButtonLabel}
            </Button>
            <Button 
              type="button" 
              size="sm" 
              onClick={handleSave}
              disabled={isEmpty}
            >
              {saveButtonLabel}
            </Button>
          </div>
        </div>
      )}
      
      {!disabled && !isSigning && (
        <div className="flex justify-end">
          {value && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleClear}
            >
              {clearButtonLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}