
'use client';
import * as React from "react";
import { MAPBOX_TOKEN } from "@/lib/mapbox";

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
      const number = f.address || "";
      const street = f.text || "";
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
  minLength = 1, // Allow single character searches for postcodes
  debounceMs = 100,
  ...unknownProps // Capture any unknown props to prevent them from reaching the DOM
}: AddressAutocompleteProps) {
  const [items, setItems] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [searchAttempted, setSearchAttempted] = React.useState(false);
  
  // Refs to prevent double selection and API calls during selection
  const isSelectingRef = React.useRef(false);
  const lastSelectedIdRef = React.useRef<string | null>(null);
  const isValueUpdateFromSelectionRef = React.useRef(false);
  const ctrlRef = React.useRef<AbortController | null>(null);

  // Fetch suggestions
  React.useEffect(() => {
    if (!value || value.length < minLength || disabled || isSelectingRef.current || isValueUpdateFromSelectionRef.current) {
      if (isSelectingRef.current) {
        // API call blocked - selecting in progress
        console.log('[AddressAutocomplete] API call blocked - selection in progress');
      }
      if (isValueUpdateFromSelectionRef.current) {
        // API call blocked - value update from selection
        console.log('[AddressAutocomplete] API call blocked - value update from selection');
      }
      setItems([]);
      setOpen(false);
      setSearchAttempted(false);
      return;
    }
    
    // Debug postcode detection
    const isPostcodeQuery = /^[A-Z]{1,2}[0-9]/i.test(value);
    if (isPostcodeQuery) {
      console.log('[AddressAutocomplete] Postcode query detected:', value);
    }

    const c = new AbortController();
    ctrlRef.current?.abort();
    ctrlRef.current = c;

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setSearchAttempted(true);
        const url = `/api/places/suggest?q=${encodeURIComponent(value)}&country=${country}&limit=${limit}`;
        
        console.log('[AddressAutocomplete] Searching:', value, 'URL:', url);
        
        // Add timeout and better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout (reduced from 10)
        
        const res = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        
        console.log('[AddressAutocomplete] Raw response:', data);
        
        const normalizedItems = normalizeSuggestions(data);
        
        console.log('[AddressAutocomplete] Normalized items:', normalizedItems);
        
        setItems(normalizedItems);
        setOpen(true);
      } catch (err) {
        console.error('[AddressAutocomplete] Fetch error:', err);
        
        // Try fallback: direct Mapbox API call
        try {
          const fallbackUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?autocomplete=true&limit=${limit}&country=${country}&access_token=${MAPBOX_TOKEN}`;
          
          const fallbackRes = await fetch(fallbackUrl);
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
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
      // Selection blocked - already selecting or no item
      return; // Prevent double selection
    }
    
    // Check if this item was already selected recently
    if (lastSelectedIdRef.current === item.id) {
      console.log('[AddressAutocomplete] Item already selected recently:', item.id);
      return; // Prevent duplicate selection
    }
    
    // Set selection flag to prevent double selection
    isSelectingRef.current = true;
    lastSelectedIdRef.current = item.id;
    
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
        address.postcode = address.postcode || parts[parts.length - 1]?.trim() || "";
        // Middle parts are usually city
        address.city = address.city || parts.slice(1, -1).join(',').trim() || "";
      }
    }
    
    const selection: AutocompleteSelection = {
      id: item.id,
      label: item.label,
      address,
      coords: item.coords,
      raw: item
    };
    
    console.log('AddressAutocomplete selecting:', selection);
    
    // Call onSelect with the prepared selection
    onSelect(selection);
    
    // Set flag to prevent API calls when parent updates the value
    isValueUpdateFromSelectionRef.current = true;
    
    // Don't call onChange here - let the parent component handle updating the search field
    // This prevents the search effect from being triggered when an item is selected
    
    // Close the dropdown and clear items
    setOpen(false);
    setItems([]);
    setActiveIndex(0);
    
    // Reset the selection flag after a short delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
    
    // Reset the value update flag after a longer delay to allow parent to update value
    setTimeout(() => {
      isValueUpdateFromSelectionRef.current = false;
    }, 200);
    
    // Reset the last selected ID after a longer delay
    setTimeout(() => {
      lastSelectedIdRef.current = null;
    }, 500);
  };

  const handleFocus = () => {
    if (items.length > 0 && !isSelectingRef.current) {
      // Focus - opening menu
      setOpen(true);
    } else {
      // Focus blocked - no items or selecting
    }
  };

  const handleBlur = () => {
    // Only close if we're not in the middle of selecting
    if (!isSelectingRef.current) {
      // Blur - closing menu
      setTimeout(() => {
        setOpen(false);
        setItems([]); // Clear items when losing focus
      }, 150);
    } else {
      // Blur blocked - selecting in progress
      console.log('[AddressAutocomplete] Blur blocked - selection in progress');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

  // Filter out unknown props to prevent them from reaching the DOM
  const inputProps = Object.fromEntries(
    Object.entries(unknownProps).filter(([key]) => 
      !['className', 'style', 'id', 'name', 'aria-label', 'aria-describedby'].includes(key)
    )
  );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        {...inputProps}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="address-input"
        disabled={disabled}
      />

      {open && (
        <ul className="autocomplete-menu">
          {loading && (
            <li className="loading-item">
              <div className="loading-spinner"></div>
              <span>Searching addresses...</span>
            </li>
          )}
          {!loading && items.length === 0 && searchAttempted && (
            <li className="no-results">
              <span>No addresses found. Try a different search term.</span>
            </li>
          )}
          {!loading && items.length > 0 && items.map((s, i) => (
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
                
                // Check if this item was already selected recently
                if (lastSelectedIdRef.current === items[i].id) {
                  console.log('[AddressAutocomplete] Click blocked - item already selected recently');
                  return;
                }
                
                console.log('[AddressAutocomplete] Clicking on item:', i, items[i]);
                
                // Clicking on item:
                selectItem(i);
              }}
            >
              <div className="suggestion-main">{s.label}</div>
              {s.secondary && <small className="suggestion-secondary">{s.secondary}</small>}
              {s.address?.line1 && s.address.line1 !== s.label && (
                <small className="suggestion-detail">
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
        .address-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          border-bottom: 1px solid #333;
        }
        .autocomplete-menu li:last-child {
          border-bottom: none;
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
        .loading-item {
          color: #A3A3A3;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-style: italic;
        }
        .no-results {
          color: #A3A3A3;
          padding: 16px;
          text-align: center;
          font-style: italic;
        }
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #404040;
          border-top: 2px solid #00C2FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .suggestion-main {
          font-weight: 500;
          margin-bottom: 4px;
        }
        .suggestion-secondary {
          color: #A3A3A3;
          display: block;
          margin-top: 2px;
          font-size: 12px;
        }
        .suggestion-detail {
          color: #00C2FF;
          display: block;
          margin-top: 4px;
          font-size: 11px;
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


