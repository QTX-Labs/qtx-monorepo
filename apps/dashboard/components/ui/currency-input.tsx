'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@workspace/ui/components/input';
import numeral from 'numeral';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
  disabled = false,
  className = ""
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Actualizar display cuando cambia el valor externo
  useEffect(() => {
    if (!isFocused && value !== undefined && value !== null) {
      setDisplayValue(numeral(value).format('0,0.00'));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Permitir vacío
    if (input === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Remover todo excepto números, punto y signo menos
    const cleaned = input.replace(/[^0-9.-]/g, '');

    // Validar formato
    const isValid = /^-?\d*\.?\d{0,2}$/.test(cleaned);

    if (isValid) {
      setDisplayValue(input);
      const num = parseFloat(cleaned) || 0;
      onChange(num);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Mostrar valor sin formato al enfocar
    if (value !== 0) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Aplicar formato al desenfocar
    const num = parseFloat(displayValue.replace(/[^0-9.-]/g, '')) || 0;
    setDisplayValue(numeral(num).format('0,0.00'));
    onChange(num);
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
