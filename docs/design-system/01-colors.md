# COLOR SYSTEM

## Primary Palette
| Token          | Hex       | Usage                    |
|---------------|-----------|--------------------------|
| primary-500   | #2D6A4F   | Main brand color, CTAs   |
| primary-700   | #1B4332   | Headers, dark sections   |
| primary-400   | #52B788   | Hover states, accents    |

## Secondary Palette
| Token          | Hex       | Usage                    |
|---------------|-----------|--------------------------|
| secondary-400 | #E09F3E   | Stars, premium feel      |
| secondary-600 | #F77F00   | Add to Cart, urgency     |

## Neutral Palette
| Token          | Hex       | Usage                    |
|---------------|-----------|--------------------------|
| neutral-900   | #212529   | Body text                |
| neutral-600   | #6C757D   | Secondary text           |
| neutral-100   | #F1F3F5   | Backgrounds              |
| white         | #FFFFFF   | Cards, clean space       |

## Semantic Colors
| State    | Hex       | Usage                        |
|---------|-----------|------------------------------|
| success | #28A745   | In stock, order confirmed    |
| warning | #FFC107   | Low stock, alerts            |
| error   | #DC3545   | Out of stock, errors         |
| info    | #17A2B8   | Delivery info, tips          |

## Gradients
- Hero Background : `linear-gradient(135deg, #1B4332 0%, #52B788 100%)`
- CTA Button : `linear-gradient(90deg, #E09F3E 0%, #F77F00 100%)`
- Overlay : `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`

## Tailwind Implementation
These are already configured in `tailwind.config.js`
Use as: `bg-primary-500`, `text-primary-700`, `border-secondary-400`
