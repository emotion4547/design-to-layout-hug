import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

// Convert HSL to HEX
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Convert HEX to HSL
const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Parse HSL string "h s% l%" to object
const parseHslString = (hsl: string): { h: number; s: number; l: number } | null => {
  const match = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?/);
  if (!match) return null;
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
};

export const ColorPicker = ({ value, onChange, label }: ColorPickerProps) => {
  const [hexValue, setHexValue] = useState('#8a2be2');
  const [hue, setHue] = useState(275);
  const [saturation, setSaturation] = useState(76);
  const [lightness, setLightness] = useState(53);

  // Parse incoming value (HSL string format: "h s% l%")
  useEffect(() => {
    if (value) {
      const parsed = parseHslString(value);
      if (parsed) {
        setHue(parsed.h);
        setSaturation(parsed.s);
        setLightness(parsed.l);
        setHexValue(hslToHex(parsed.h, parsed.s, parsed.l));
      }
    }
  }, [value]);

  const updateColor = useCallback((h: number, s: number, l: number) => {
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setHexValue(hslToHex(h, s, l));
    onChange(`${h} ${s}% ${l}%`);
  }, [onChange]);

  const handleHexChange = (hex: string) => {
    setHexValue(hex);
    if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      const hsl = hexToHsl(hex);
      if (hsl) {
        setHue(hsl.h);
        setSaturation(hsl.s);
        setLightness(hsl.l);
        onChange(`${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }
    }
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = parseInt(e.target.value);
    updateColor(h, saturation, lightness);
  };

  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const s = parseInt(e.target.value);
    updateColor(hue, s, lightness);
  };

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const l = parseInt(e.target.value);
    updateColor(hue, saturation, l);
  };

  return (
    <div className="space-y-4">
      {label && <Label className="text-base font-medium">{label}</Label>}
      
      <div className="flex items-center gap-4">
        {/* Color Preview */}
        <div 
          className="w-16 h-16 rounded-xl border-2 border-border shadow-inner flex-shrink-0"
          style={{ backgroundColor: hexValue }}
        />
        
        {/* HEX Input */}
        <div className="flex-1 space-y-2">
          <Label className="text-sm text-muted-foreground">HEX</Label>
          <Input
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#8a2be2"
            className="font-mono uppercase"
          />
        </div>
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm text-muted-foreground">Оттенок</Label>
          <span className="text-sm text-muted-foreground">{hue}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={handleHueChange}
          className={cn(
            "w-full h-3 rounded-full appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
          )}
          style={{
            background: `linear-gradient(to right, 
              hsl(0, ${saturation}%, ${lightness}%), 
              hsl(60, ${saturation}%, ${lightness}%), 
              hsl(120, ${saturation}%, ${lightness}%), 
              hsl(180, ${saturation}%, ${lightness}%), 
              hsl(240, ${saturation}%, ${lightness}%), 
              hsl(300, ${saturation}%, ${lightness}%), 
              hsl(360, ${saturation}%, ${lightness}%))`
          }}
        />
      </div>

      {/* Saturation Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm text-muted-foreground">Насыщенность</Label>
          <span className="text-sm text-muted-foreground">{saturation}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={saturation}
          onChange={handleSaturationChange}
          className={cn(
            "w-full h-3 rounded-full appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
          )}
          style={{
            background: `linear-gradient(to right, 
              hsl(${hue}, 0%, ${lightness}%), 
              hsl(${hue}, 100%, ${lightness}%))`
          }}
        />
      </div>

      {/* Lightness Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm text-muted-foreground">Яркость</Label>
          <span className="text-sm text-muted-foreground">{lightness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={lightness}
          onChange={handleLightnessChange}
          className={cn(
            "w-full h-3 rounded-full appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
          )}
          style={{
            background: `linear-gradient(to right, 
              hsl(${hue}, ${saturation}%, 0%), 
              hsl(${hue}, ${saturation}%, 50%), 
              hsl(${hue}, ${saturation}%, 100%))`
          }}
        />
      </div>
    </div>
  );
};
