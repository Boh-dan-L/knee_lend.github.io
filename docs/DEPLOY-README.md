# Hybrid: old pixel/payment stack + new design/copy

Ця збірка призначена для контрольного тесту старого Meta pixel/dataset на новому лендингу.

## Зі старого лендинга
- Домен: `bogdan92.pro`
- GTM: `GTM-TPZT7VDW`
- Server pixel route: `pixel_knee`
- `landing_id`: `knee`
- Product IDs: `knee_390`, `knee_890`
- Browser `meta_initiate_checkout` через dataLayer + server CAPI `/checkout` з однаковим `checkout_event_id` для дедуплікації.
- Purchase на thank-you сторінках: `meta_purchase` з `event_id` + `order_ref`, захист від повторного fire при F5.

## З нового лендинга
- Увесь актуальний копірайт, структура й дизайн.
- Новий дизайн `thank-you-390` та `thank-you-890`.
- Виправлена атрибуція `_fbc`/`fbclid`: timestamp зберігається в мілісекундах (`Date.now()`), а справжній cookie `_fbc` передається без переформатування.
- Діагностика платежу та додатковий `payment_redirect_started`.

## Прогрів платіжного Cloud Run
- `<link rel="preconnect">` до `bayer-1078313683185.europe-west1.run.app`.
- Через 800 мс після DOMContentLoaded викликається `GET /health` з `cache: no-store`.
- Додатковий warm-up при `pointerenter`, `touchstart` або `focus` на кнопці оплати.

## GTM
Старий контейнер має слухати custom event `meta_initiate_checkout` і використовувати:
- `checkout.event_id`
- `checkout.value`
- `checkout.currency`

Purchase custom event: `meta_purchase` з:
- `purchase.event_id`
- `purchase.order_ref`
- `purchase.value`
- `purchase.currency`

Не додавайте новий Pixel ID `1610503490748384` у цю збірку: він навмисно видалений, щоб контрольний тест ішов через старий GTM/pixel route.
