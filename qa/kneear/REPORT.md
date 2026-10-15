# Kneear — implementation and verification

Repository: Boh-dan-L/knee_lend.github.io
Branch: feature/kneear-landing
Local page: docs/kneear/index.html
Preview: http://127.0.0.1:8765/kneear/
Future production URL: https://bogdan92.pro/kneear/ (not published).

## Changes
- Independent kneear directory: index.html, original knee.css and knee.js, kneear.css, reviews.js, copied img/ and video/ assets.
- Approved brief copy and section order; four result cards; NICE recommendation source; arthrosis FAQ; explicit general-course positioning and arthrosis bonus explanation.
- Six unique supplied review images. IMG_6303 duplicates IMG_6302 and is excluded. Explicit gonarthrosis review first, walking/stairs and mobility next. Original reviews retained in an expandable section.
- Review screenshots retain their original proportions and text; modal enlargement. No image editing or invented diagnoses.
- Prices 590/1090. Following the owner’s explicit revision, crossed-out 1899 and promotional 590 restored in hero and base pricing card. 2899 remains omitted.
- Original payment/analytics inline scripts, product IDs, GTM container and quiz JS are unchanged byte for byte. No new analytics. Existing landing_id=knee and pixel_key=pixel_knee retained because backend mapping is not available. kneear has no independent analytics identifier.
- No CNAME, deployment configuration, workflows or original kneeq changes.

## Passed
- Chrome desktop browser with external requests blocked during QA to avoid advertising events or payment calls.
- Widths 375, 390, 430, 768, 1440: no horizontal overflow; screenshots attached.
- Quiz completed: self-guided, personal recommendations, and defer-start safety results.
- FAQ expansion, personal modal, Escape dismissal, review enlargement.
- Every data-scroll-to anchor resolves. Product IDs knee_590/knee_1090 preserved.
- One GTM loader. Quiz responses remain in page memory; no analytics added to quiz.
- All relative HTML resources exist, unique DOM IDs, JavaScript syntax checks, original tracked kneeq diff empty.
- Sticky CTA hidden while hero/pricing/reviews are visible and while dialogs are open.

## Limits
- No real checkout/order creation, WayForPay submission, payment or purchase event tested. Payment transport and backend availability unverified; original integration preserved.
- Live GTM/CAPI delivery and deduplication unverified; external calls blocked in QA. Preserving code does not certify third-party container behavior.
- No Lighthouse/Core Web Vitals score or physical iPhone test. Responsive checks used Chrome viewport emulation; external webfont/analytics delivery excluded.
- Author experience, patient count and curriculum contents taken from existing site and owner brief, not independently audited. NICE supports exercise principles, not this specific product.
- Prior unrelated untracked file in docs/kneeq/shared/js remains untouched.
- No commit, push or deploy performed.

## Design revision
- Eight photo cards added across recognition and results blocks, using original photos and one sourced Pexels walking photo (see IMAGE-SOURCES.md).
- All review groups changed to native horizontal scroll-snap carousels, with arrow buttons and keyboard support. Enlarged originals still open in a dialog.
- Cards, notes, section backgrounds and review captions now use original --theme-* colors. Warm beige/teal deviations removed.
- Repeat responsive QA at 375/390/430/768/1440: no document overflow, eight photo elements, no broken loaded images, no JS errors. Carousel arrows/keyboard and modal verified.
- Original payment, analytics and quiz code remain unchanged. No commit, push or deploy.

## Exercise preview revision
- Embedded owner-supplied acute-stage clip below basic stage and Y balance below functional stage. Matching compact 4:3 frames, maximum width 360px.
- Functional video focuses on knees and feet (object-position 90%); acute preview crops the source’s vertical black padding. Original media files retained.
- Muted autoplay/loop/playsinline and existing lazy loader; pause/play controls added. Posters are actual video frames.
- Chrome: both local clips load and play muted; pause/play works. Matching frame sizes verified at 375/390/430/1440, no horizontal overflow.
- Sticky purchase CTA hidden while program section is visible, avoiding the overlap shown in owner screenshot.
- Native MOV inputs verified in Chrome; physical Safari/iPhone playback not tested.
