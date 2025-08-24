
'use client';
import * as React from "react";

export type AddressParts = {
  line1: string;
  city?: string;
  postcode?: string;
};

export type Coordinates = { lat: number; lng: number } | null;

export type Suggestion = {
  id: string;
  label: string;
  secondary?: string;
  address?: AddressParts;
  coords?: Coordinates;
};

export type AutocompleteSelection = {
  id: string;
  label: string;
  address: AddressParts;
  coords: Coordinates;
  raw?: any;
};

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (sel: AutocompleteSelection) => void;
  placeholder?: string;
  disabled?: boolean;
  country?: string;
  limit?: number;
  minLength?: number;
  debounceMs?: number;
  // Allow other props but filter them out before passing to DOM
  [key: string]: any;
}

/** Normalize API response → Suggestion[] */
function normalizeSuggestions(data: any): Suggestion[] {
  // API now returns processed suggestions directly
  if (Array.isArray(data)) {
    return data.map((item: any) => {
      // Extract data from label if address data is missing
      const parts = item.label.split(',');
      const line1 = item.address?.line1 || parts[0]?.trim() || item.label;
      let city = item.address?.city || "";
      let postcode = item.address?.postcode || "";
      
      // If we don't have city/postcode, try to extract from label
      if (!city || !postcode) {
        if (parts.length > 1) {
          // Last part is usually postcode
          postcode = postcode || parts[parts.length - 1]?.trim() || "";
          // Middle parts are usually city
          city = city || parts.slice(1, -1).join(',').trim() || "";
        }
      }
      
      return {
        id: item.id,
        label: item.label,
        secondary: [postcode, city].filter(Boolean).join(" · "),
        address: {
          line1,
          city,
          postcode,
        },
        coords: item.coords,
      };
    });
  }
  
  // Fallback for raw Mapbox response (if needed)
  const features = data?.features || [];
  if (features.length) {
    return features.map((f: any) => {
      const label = f.place_name || "";
      const ctx = Array.isArray(f?.context) ? f.context : [];
      const getContext = (prefix: string) => 
        ctx.find((c: any) => typeof c?.id === 'string' && c.id.startsWith(prefix))?.text || '';
      
      const postcode = f?.properties?.postcode || getContext('postcode') || "";
      const city = getContext('place') || getContext('locality') || getContext('district') || 
                   f?.properties?.place || "";
      const number = f?.address || "";
      const street = f?.text || "";
      const line1 = [number, street].filter(Boolean).join(' ').trim() || label.split(",")[0] || label;

      return {
        id: f.id,
        label,
        secondary: [postcode, city].filter(Boolean).join(" · "),
        address: {
          line1,
          city,
          postcode,
        },
        coords: f.center ? { lat: f.center[1], lng: f.center[0] } : null,
      };
    });
  }
  return [];
}

/** Address Autocomplete Input */
export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing an address...",
  disabled = false,
  country = "GB",
  limit = 6,
  minLength = 3,
  debounceMs = 250,
  ...unknownProps // Capture any unknown props to prevent them from reaching the DOM
}: AddressAutocompleteProps) {
  console.log('🎯 [AddressAutocomplete] Component rendered with props:', { value, onChange, onSelect, placeholder, country, limit, minLength, debounceMs });
  console.log('🔍 [AddressAutocomplete] This should appear in console!');
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const isSelectingRef = React.useRef(false);
  const ctrlRef = React.useRef<AbortController | null>(null);

  // Fetch suggestions
  React.useEffect(() => {
    if (!value || value.length < minLength || disabled || isSelectingRef.current) {
      if (isSelectingRef.current) {
        console.log('[AddressAutocomplete] API call blocked - selecting in progress');
      }
      setItems([]);
      setOpen(false);
      return;
    }

    const c = new AbortController();
    ctrlRef.current?.abort();
    ctrlRef.current = c;

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const url = `/api/places/suggest?q=${encodeURIComponent(value)}&country=${country}&limit=${limit}`;
        console.log('[AddressAutocomplete] Making API call to:', url);
        console.log('[AddressAutocomplete] Signal aborted:', c.signal.aborted);
        
        // Add timeout and better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log('[AddressAutocomplete] Response status:', res.status);
        console.log('[AddressAutocomplete] Response ok:', res.ok);
        console.log('[AddressAutocomplete] Response headers:', Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // Debug logging
        console.log('[AddressAutocomplete] API response:', data);
        
        const normalizedItems = normalizeSuggestions(data);
        console.log('[AddressAutocomplete] Normalized items:', normalizedItems);
        
        setItems(normalizedItems);
        setOpen(true);
      } catch (err) {
        console.error('[AddressAutocomplete] Fetch error:', err);
        console.error('[AddressAutocomplete] Error details:', {
          message: err?.message,
          name: err?.name,
          stack: err?.stack
        });
        
        // Try fallback: direct Mapbox API call
        try {
          console.log('[AddressAutocomplete] Trying fallback Mapbox API...');
          const fallbackUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?autocomplete=true&limit=${limit}&country=${country}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
          console.log('[AddressAutocomplete] Fallback URL:', fallbackUrl);
          
          const fallbackRes = await fetch(fallbackUrl);
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            console.log('[AddressAutocomplete] Fallback success:', fallbackData);
            const fallbackItems = normalizeSuggestions(fallbackData);
            setItems(fallbackItems);
            setOpen(true);
            return;
          }
        } catch (fallbackErr) {
          console.error('[AddressAutocomplete] Fallback also failed:', fallbackErr);
        }
        
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      c.abort();
      clearTimeout(t);
    };
  }, [value, minLength, debounceMs, country, limit, disabled]);

  const selectItem = (idx: number) => {
    const item = items[idx];
    if (!item || isSelectingRef.current) {
      console.log('[AddressAutocomplete] Selection blocked - already selecting or no item');
      return; // Prevent double selection
    }
    
    console.log('[AddressAutocomplete] Starting selection for item:', item.label);
    isSelectingRef.current = true;
    
    // Ensure we have proper address data
    let address = item.address ?? { line1: item.label };
    
    // If line1 is empty or too short, try to extract from label
    if (!address.line1 || address.line1.length < 3) {
      const parts = item.label.split(',');
      address.line1 = parts[0]?.trim() || item.label;
    }
    
    // If we don't have proper city/postcode, try to extract from label
    if (!address.city || !address.postcode) {
      const parts = item.label.split(',');
      if (parts.length > 1) {
        // Last part is usually postcode
        address.postcode = address.postcode || parts[parts.length - 1].trim();
        // Middle parts are usually city
        address.city = address.city || parts.slice(1, -1).join(',').trim();
      }
    }
    
    const sel: AutocompleteSelection = {
      id: item.id,
      label: item.label,
      address,
      coords: item.coords ?? null,
      raw: item,
    };
    
    // Debug logging
    console.log('[AddressAutocomplete] Selected item:', sel);
    
    // Close menu immediately to prevent any focus issues
    setOpen(false);
    setItems([]); // Clear items to prevent re-selection
    setActiveIndex(0); // Reset active index
    
    // Update value and trigger selection
    onChange(item.label);
    onSelect(sel);
    
    // Reset selection flag after a longer delay to prevent any race conditions
    setTimeout(() => {
      console.log('[AddressAutocomplete] Resetting selection flag');
      isSelectingRef.current = false;
    }, 500); // Increased delay to prevent double selection
  };

  return (
    <div 
      style={{ position: "relative" }}
      onClick={(e) => {
        // Prevent clicks on the container from interfering with selection
        e.stopPropagation();
      }}
    >
      <input
        // Only pass valid HTML attributes to the input element
        // unknownProps (like leftIcon) are filtered out above
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (items.length > 0 && !isSelectingRef.current) {
            console.log('[AddressAutocomplete] Focus - opening menu');
            setOpen(true);
          } else {
            console.log('[AddressAutocomplete] Focus blocked - no items or selecting');
          }
        }}
        onBlur={() => {
          // Only close if we're not in the middle of selecting
          if (!isSelectingRef.current) {
            console.log('[AddressAutocomplete] Blur - closing menu');
            setTimeout(() => {
              setOpen(false);
              setItems([]); // Clear items when losing focus
            }, 150);
          } else {
            console.log('[AddressAutocomplete] Blur blocked - selecting in progress');
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, items.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            selectItem(activeIndex);
          }
        }}
        placeholder={placeholder}
        className="address-input"
      />

      {open && (
        <ul className="autocomplete-menu">
          {loading && <li className="muted">Searching...</li>}
          {!loading &&
            items.map((s, i) => (
              <li
                key={s.id}
                className={i === activeIndex ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Additional protection against double clicks
                  if (isSelectingRef.current) {
                    console.log('[AddressAutocomplete] Click blocked - already selecting');
                    return;
                  }
                  
                  console.log('[AddressAutocomplete] Clicking on item:', s.label);
                  selectItem(i);
                }}
              >
                <div>{s.label}</div>
                {s.secondary && <small>{s.secondary}</small>}
                {s.address?.line1 && s.address.line1 !== s.label && (
                  <small style={{ color: '#666', display: 'block', marginTop: '2px' }}>
                    📍 {s.address.line1}
                  </small>
                )}
              </li>
            ))}
        </ul>
      )}

      <style>{`
        .address-input {
          width: 100%;
          height: 44px;
          border: 2px solid #404040;
          border-radius: 12px;
          padding: 0 16px;
          background-color: #262626;
          color: #FFFFFF;
          font-size: 16px;
          outline: none;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .address-input:hover {
          border-color: #00C2FF;
        }
        .address-input:focus {
          border-color: #00C2FF;
          box-shadow: 0 0 20px rgba(0,194,255,0.3);
          background-color: #1A1A1A;
        }
        .address-input::placeholder {
          color: #A3A3A3;
        }
        .autocomplete-menu {
          position: absolute;
          background: #1A1A1A;
          border: 1px solid #404040;
          border-radius: 12px;
          margin-top: 4px;
          width: 100%;
          max-height: 280px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 6px 16px rgba(0,0,0,0.5);
        }
        .autocomplete-menu li {
          padding: 12px 16px;
          cursor: pointer;
          color: #E5E5E5;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .autocomplete-menu li:hover {
          background: #333333;
        }
        .autocomplete-menu li.active {
          background: #00C2FF;
          color: #0D0D0D;
        }
        .autocomplete-menu li.active small {
          color: #0D0D0D;
        }
        .muted {
          color: #A3A3A3;
          padding: 12px 16px;
        }
        .autocomplete-menu small {
          color: #A3A3A3;
          display: block;
          margin-top: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}


