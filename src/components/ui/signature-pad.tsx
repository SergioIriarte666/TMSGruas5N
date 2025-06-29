import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eraser, Check, X } from 'lucide-react';

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
  penColor = 'black'
}: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Cargar firma existente
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
    if (signatureRef.current) {
      if (signatureRef.current.isEmpty()) {
        setIsEmpty(true);
        return;
      }
      
      const dataUrl = signatureRef.current.toDataURL('image/png');
      onChange(dataUrl);
      setIsEditing(false);
      setIsEmpty(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (signatureRef.current && value) {
      signatureRef.current.fromDataURL(value);
      setIsEmpty(false);
    } else {
      handleClear();
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const startEditing = () => {
    if (!disabled) {
      setIsEditing(true);
      if (signatureRef.current) {
        signatureRef.current.clear();
        setIsEmpty(true);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div 
          className={`relative ${disabled && !value ? 'opacity-50' : ''}`}
          style={{ height: `${height}px` }}
        >
          {!isEditing && value && !isEmpty ? (
            // Mostrar firma guardada
            <div 
              className="w-full h-full flex items-center justify-center cursor-pointer"
              onClick={startEditing}
              style={{ backgroundColor: '#f9fafb' }}
            >
              <img 
                src={value} 
                alt="Firma" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            // Mostrar canvas de firma
            <div className="w-full h-full">
              <SignatureCanvas
                ref={signatureRef}
                penColor={penColor}
                canvasProps={{
                  width: '100%',
                  height: height,
                  className: 'signature-canvas',
                  style: { 
                    width: '100%', 
                    height: '100%',
                    backgroundColor: '#f9fafb',
                    cursor: disabled ? 'not-allowed' : 'crosshair'
                  }
                }}
                onBegin={handleBegin}
                clearOnResize={false}
              />
              
              {/* Placeholder */}
              {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400">
                  {placeholder}
                </div>
              )}
            </div>
          )}
          
          {/* Botones de acción */}
          {isEditing && (
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleClear}
                className="bg-white"
              >
                <Eraser className="w-4 h-4 mr-1" />
                {clearButtonLabel}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                className="bg-white"
              >
                <X className="w-4 h-4 mr-1" />
                {cancelButtonLabel}
              </Button>
              <Button 
                type="button" 
                size="sm"
                onClick={handleSave}
                className="bg-primary text-primary-foreground"
              >
                <Check className="w-4 h-4 mr-1" />
                {saveButtonLabel}
              </Button>
            </div>
          )}
          
          {/* Botón para iniciar edición */}
          {!isEditing && !disabled && (
            <div className="absolute bottom-2 right-2">
              <Button 
                type="button" 
                size="sm"
                onClick={startEditing}
                className="bg-primary text-primary-foreground"
              >
                {value && !isEmpty ? 'Cambiar Firma' : 'Firmar'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}