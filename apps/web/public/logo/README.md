# Speedy Van Logo Suite

High-end neon dark design system logo collection for the Speedy Van brand.

## Logo Variants

### 1. Full Logo - Dark Background (`speedy-van-logo-dark.svg`)
- **Size**: 240×80px
- **Background**: Dark gradient (#0D0D0D → #1A1A1A)
- **Use cases**: Primary brand identity, dark websites, app headers
- **Features**: 
  - Van icon with neon glow trails
  - Typography with neon effects
  - Motion-inspired "V" with arrow styling
  - Optimized for dark surfaces

### 2. Full Logo - Light Background (`speedy-van-logo-light.svg`)
- **Size**: 240×80px
- **Background**: Light gradient (#FFFFFF → #F8F9FA)
- **Use cases**: Light backgrounds, print materials, documents
- **Features**:
  - Adapted colors for light surfaces
  - Maintains neon aesthetic with drop shadows
  - Professional appearance for business contexts

### 3. App Icon (`speedy-van-icon.svg`)
- **Size**: 64×64px
- **Design**: Stylized "S" and "V" combination
- **Use cases**: App icons, favicons, social media avatars
- **Features**:
  - Circular background with neon border
  - Abstract "S" curve + arrow "V"
  - Speed lines for motion
  - Works at small sizes

### 4. Wordmark Only (`speedy-van-wordmark.svg`)
- **Size**: 200×60px
- **Design**: Text-only logo with special "V"
- **Use cases**: Headers, signatures, minimal branding
- **Features**:
  - Emphasis on motion-styled "V"
  - Clean typography
  - Neon glow effects
  - Space-efficient

### 5. Minimal Icon (`speedy-van-minimal-icon.svg`)
- **Size**: 48×48px
- **Design**: Simplified van outline
- **Use cases**: Small UI elements, buttons, status indicators
- **Features**:
  - Geometric van shape
  - Single motion line
  - Clean and scalable
  - Maintains brand recognition

## Design System Integration

### Colors Used
- **Primary Neon Blue**: #00E0FF
- **Accent Neon Purple**: #B026FF  
- **Success Neon Green**: #39FF14
- **Dark Background**: #0D0D0D → #1A1A1A gradient
- **Light Background**: #FFFFFF → #F8F9FA gradient

### Typography
- **Font Family**: Inter (system fallback: system-ui, sans-serif)
- **Weight**: 900 (Black/ExtraBold)
- **Styling**: Neon glow effects via SVG filters

### Effects
- **Neon Glow**: Gaussian blur + merge filters
- **Motion Trails**: Gradient opacity trails
- **Drop Shadows**: For light background variants

## Usage Guidelines

### Sizing Recommendations
- **Minimum Size**: 24px height for icon variants
- **Web Headers**: Use full logo at 240×80px or scale proportionally
- **Mobile**: Use minimal icon (48×48px) or wordmark (200×60px)
- **Print**: Use light background variant

### Background Requirements
- **Dark Variants**: Use on backgrounds darker than #333333
- **Light Variants**: Use on backgrounds lighter than #CCCCCC
- **Transparency**: All logos work on transparent backgrounds

### File Format Notes
- **SVG**: Vector format, infinitely scalable, web-optimized
- **No PNG versions provided**: SVG covers all use cases better
- **Web Performance**: All files optimized for fast loading

## Implementation Examples

### HTML Usage
```html
<!-- Primary logo on dark background -->
<img src="/logo/speedy-van-logo-dark.svg" alt="Speedy Van" width="240" height="80">

<!-- App icon -->
<img src="/logo/speedy-van-icon.svg" alt="Speedy Van" width="64" height="64">

<!-- Minimal icon for UI -->
<img src="/logo/speedy-van-minimal-icon.svg" alt="Speedy Van" width="48" height="48">
```

### CSS Integration
```css
.logo-primary {
  background-image: url('/logo/speedy-van-logo-dark.svg');
  background-size: contain;
  background-repeat: no-repeat;
}

.logo-icon {
  background-image: url('/logo/speedy-van-icon.svg');
  width: 64px;
  height: 64px;
}
```

### Favicon Setup
```html
<link rel="icon" type="image/svg+xml" href="/logo/speedy-van-icon.svg">
<link rel="apple-touch-icon" href="/logo/speedy-van-icon.svg">
```

## Quality Assurance

### Tested Contexts
- ✅ Web browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile devices (iOS, Android)
- ✅ High DPI displays (Retina, 4K)
- ✅ Print (when using light variant)
- ✅ Various background colors

### Accessibility
- ✅ High contrast ratios maintained
- ✅ Alternative text compatible
- ✅ Scalable without quality loss
- ✅ Works with screen readers

### Brand Consistency
- ✅ Aligns with neon dark design system
- ✅ Consistent with theme colors
- ✅ Professional yet modern aesthetic
- ✅ Memorable and distinctive

## File Structure
```
/logo/
├── speedy-van-logo-dark.svg      # Primary dark background logo
├── speedy-van-logo-light.svg     # Light background variant
├── speedy-van-icon.svg           # App icon with S+V design
├── speedy-van-wordmark.svg       # Text-only logo
├── speedy-van-minimal-icon.svg   # Minimal van icon
└── README.md                     # This documentation
```

---

**Created**: Speedy Van Neon Dark Design System  
**Version**: 1.0  
**Last Updated**: 2024  
**Format**: SVG (Scalable Vector Graphics)
