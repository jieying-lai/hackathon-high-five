# Career atlas design update — jie-ying

The entry journey is Discover (optional quiz), Explore (work-life atlas), Begin (existing portal/CV/jobs/learning). Visitors can choose any entry without finishing the quiz. The atlas itself uses place → career → daily routine → existing career action. No employment decisions or match scores were changed.

## Implementation
- Locally served Natural Earth 1:110m coastline, orthographic canvas projection, coordinate-correct city markers.
- Pointer/touch rotation, keyboard arrows, zoom, recenter, city fly-to, local timezone clock, opt-in rotation.
- Animation pauses when the atlas closes or the document is hidden; reduced-motion preferences bypass fly-to animation.
- City buttons remain usable if geographic data fails. Only 10 curated cities currently have stories; stories are illustrative, not verified interviews, video footage, or live vacancy feeds.
- Desktop map/story split; stacked layout on small screens. Dialog supports Escape, focus return and keyboard focus containment.

## References and attribution
- https://github.com/cambecc/earth — geographic projection and globe-first exploration inspiration. No source code copied.
- https://github.com/google/material-design-lite — interaction hierarchy and cross-device controls. No MDL dependency added (project is in limited support).
- https://github.com/alchaincyf/huashu-design — editorial hierarchy and state-driven motion inspiration. No code copied or plugin installed.
- https://github.com/cathrynlavery/diagram-design — numbered narrative sequence and clear information relationships. No code copied or plugin installed.
- Coastline: Natural Earth, public domain. https://www.naturalearthdata.com/about/terms-of-use/ ; downloaded from https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_coastline.geojson on 2026-10-23.

This update changes the entry flow and atlas in both public and talent views. It does not claim to redesign every employer/admin screen or add global vacancy coverage.

## Aurora / bento iteration
- Hero now leads with “Find work that feels like you”, a direct work-style CTA and an optional atlas route.
- Feature bento uses two large discovery cards and three compact utility cards, consistent spacing and corner radii.
- Atlas keeps its 10 curated city destinations; selecting a place picks an illustrative role and reshuffles a three-person masonry feed. Opening a card uses the existing detailed story and routines. No invented live interviews or new job availability.
- Amber city pulse, slow ambient gradients, a repeated work-style brand strip and subtle background parallax; pause control and reduced-motion handling included. Globe rendering capped around 30 fps, stopped while hidden.
- Skeletons cover map/image loading and the existing quiz result transition, not artificial full-page delays. Server-rendered content remains available immediately.
- Shared glass/aurora styling loaded in the landing, talent, employer and admin templates. Existing portal workflows unchanged.
- Browser checks: full 10-answer quiz, random atlas destination, person-card detail navigation, 390px mobile no horizontal document/modal overflow, no captured script errors. Projection tests: 4 passed.
