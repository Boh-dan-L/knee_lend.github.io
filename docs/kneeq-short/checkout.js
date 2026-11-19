(function () {
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function uuidv4() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getLS(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function setLS(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function saveIfExists(key, value) {
    if (value !== null && value !== undefined && value !== "") {
      setLS(key, value);
    }
  }

  function ensureExternalId() {
    let id = getLS("meta_external_id");
    if (!id) {
      id = uuidv4();
      setLS("meta_external_id", id);
    }
    return id;
  }

  function updateStoredMetaCookies() {
    const currentFbp = getCookie("_fbp");
    const currentFbc = getCookie("_fbc");

    if (currentFbp && currentFbp !== getLS("meta_fbp")) {
      setLS("meta_fbp", currentFbp);
    }

    // Передаємо справжній _fbc без змін. Його creationTime уже в мілісекундах.
    if (currentFbc && currentFbc !== getLS("meta_fbc")) {
      setLS("meta_fbc", currentFbc);
    }
  }

  function waitForMetaCookies(retries, delay) {
    updateStoredMetaCookies();

    const hasFbp = !!getLS("meta_fbp");
    const hasFbcOrNoClick = !!getLS("meta_fbc") || !getParam("fbclid");
    if (hasFbp && hasFbcOrNoClick) return;

    if (retries > 0) {
      setTimeout(function () {
        waitForMetaCookies(retries - 1, delay);
      }, delay);
    }
  }

  const utm = {
    utm_source: getParam("utm_source"),
    utm_medium: getParam("utm_medium"),
    utm_campaign: getParam("utm_campaign"),
    utm_adset: getParam("utm_adset"),
    utm_content: getParam("utm_content"),
    utm_term: getParam("utm_term")
  };

  const fbclid = getParam("fbclid");
  // ВАЖЛИВО: Meta fbc creationTime працює в мілісекундах. Не ділити Date.now() на 1000.
  const nowTs = String(Date.now());

  ensureExternalId();

  updateStoredMetaCookies();
  waitForMetaCookies(15, 300);

  const hasAttributionInUrl =
    Object.values(utm).some(Boolean) || !!fbclid;

  // FIRST TOUCH
  if (!getLS("meta_first_seen_at") && hasAttributionInUrl) {
    setLS("meta_first_seen_at", nowTs);

    saveIfExists("meta_first_utm_source", utm.utm_source);
    saveIfExists("meta_first_utm_medium", utm.utm_medium);
    saveIfExists("meta_first_utm_campaign", utm.utm_campaign);
    saveIfExists("meta_first_utm_adset", utm.utm_adset);
    saveIfExists("meta_first_utm_content", utm.utm_content);
    saveIfExists("meta_first_utm_term", utm.utm_term);
    saveIfExists("meta_first_fbclid", fbclid);
  }

  // Якщо first_seen_at ще нема взагалі — створи базовий timestamp
  if (!getLS("meta_first_seen_at")) {
    setLS("meta_first_seen_at", nowTs);
  }

  // Окремо зберігаємо точний час отримання fbclid.
  // Саме цей timestamp використовується як creationTime для fbc.
  if (fbclid) {
    if (!getLS("meta_first_fbclid")) {
      setLS("meta_first_fbclid", fbclid);
      setLS("meta_first_fbclid_seen_at", nowTs);
    }

    setLS("meta_last_fbclid", fbclid);
    setLS("meta_last_fbclid_seen_at", nowTs);
  }

  // LAST TOUCH
  if (hasAttributionInUrl) {
    setLS("meta_last_seen_at", nowTs);

    saveIfExists("meta_last_utm_source", utm.utm_source);
    saveIfExists("meta_last_utm_medium", utm.utm_medium);
    saveIfExists("meta_last_utm_campaign", utm.utm_campaign);
    saveIfExists("meta_last_utm_adset", utm.utm_adset);
    saveIfExists("meta_last_utm_content", utm.utm_content);
    saveIfExists("meta_last_utm_term", utm.utm_term);
    saveIfExists("meta_last_fbclid", fbclid);
  }

})();

document.addEventListener("DOMContentLoaded", function () {
  const localPreview = window.APP_CONFIG.localPreview;
  const API_URL = localPreview
    ? new URL("./__preview_checkout", window.location.href).href
    : "https://bayer-1078313683185.europe-west1.run.app";
  const buttons = document.querySelectorAll(".pay-btn");
  const PAGE_LOADED_AT_MS = Date.now();

  if (!buttons.length) return;

  function uuidv4() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getLS(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function getNavigationMetrics() {
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    if (!nav) return null;

    return {
      dom_content_loaded_ms: Math.round(nav.domContentLoadedEventEnd),
      load_event_ms: Math.round(nav.loadEventEnd),
      response_end_ms: Math.round(nav.responseEnd)
    };
  }

  function buildAttributionPayload() {
    return {
      external_id: getLS("meta_external_id"),
      fbp: getLS("meta_fbp"),
      fbc: getLS("meta_fbc"),
      fbclid: getLS("meta_last_fbclid") || getLS("meta_first_fbclid") || null,
      fbclid_seen_at: Number(
        getLS("meta_last_fbclid_seen_at") ||
        getLS("meta_first_fbclid_seen_at")
      ) || null,
      utm_source: getLS("meta_last_utm_source") || getLS("meta_first_utm_source") || null,
      utm_medium: getLS("meta_last_utm_medium") || getLS("meta_first_utm_medium") || null,
      utm_campaign: getLS("meta_last_utm_campaign") || getLS("meta_first_utm_campaign") || null,
      utm_adset: getLS("meta_last_utm_adset") || getLS("meta_first_utm_adset") || null,
      utm_content: getLS("meta_last_utm_content") || getLS("meta_first_utm_content") || null,
      utm_term: getLS("meta_last_utm_term") || getLS("meta_first_utm_term") || null,
      first_seen_at: Number(getLS("meta_first_seen_at")) || null,
      last_seen_at: Number(getLS("meta_last_seen_at")) || null
    };
  }

  function trackDiagnostic(eventName, details) {
    const payload = {
      event_name: eventName,
      session_id: getLS("meta_external_id"),
      landing_id: window.APP_CONFIG?.landing_id || null,
      pixel_key: window.APP_CONFIG?.pixel_key || null,
      page_url: window.location.origin + window.location.pathname,
      client_event_time_ms: Date.now(),
      attribution: buildAttributionPayload(),
      details: details || {}
    };

    try {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API_URL + "/track", blob);
        return;
      }
    } catch (error) {
      console.warn("sendBeacon unavailable:", error);
    }

    fetch(API_URL + "/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {});
  }

  let warmupStarted = false;

  function warmPaymentService(reason) {
    if (warmupStarted) return;
    warmupStarted = true;

    const startedAt = performance.now();

    fetch(API_URL + "/health", {
      method: "GET",
      cache: "no-store",
      mode: "cors"
    })
      .then(function (response) {
        console.log("payment service warm-up:", reason, Math.round(performance.now() - startedAt), "ms", response.status);
      })
      .catch(function (error) {
        console.warn("payment service warm-up failed:", error);
        warmupStarted = false;
      });
  }

  window.setTimeout(function () {
    warmPaymentService("page-load");
  }, 800);

  buttons.forEach(function (button) {
    ["pointerenter", "touchstart", "focus"].forEach(function (eventName) {
      button.addEventListener(eventName, function () {
        warmPaymentService(eventName);
      }, { once: true, passive: true });
    });
  });

  function pushBrowserCheckoutEvent(checkoutEventId, orderReference, value, currency) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "meta_initiate_checkout",
      checkout: {
        event_id: checkoutEventId,
        order_ref: orderReference,
        value: Number(value) || 0,
        currency: currency || "UAH"
      }
    });
  }

  const paymentAttempts = new Map();
  let paymentInProgress = false;
  let restorePaymentButton = null;

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) restorePaymentButton?.();
  });

  buttons.forEach(function (btn) {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      if (paymentInProgress) return;
      paymentInProgress = true;

      const originalText = btn.textContent;
      restorePaymentButton = function () {
        paymentInProgress = false;
        restorePaymentButton = null;
        btn.textContent = originalText;
        btn.disabled = false;
        btn.classList.remove("is-loading");
        btn.style.pointerEvents = "";
      };
      const productId = btn.dataset.productId;
      const attempt = paymentAttempts.get(productId) || {
        purchaseEventId: uuidv4(),
        checkoutEventId: uuidv4(),
        clickedAtMs: Date.now()
      };
      paymentAttempts.set(productId, attempt);
      const { purchaseEventId, checkoutEventId, clickedAtMs } = attempt;

      trackDiagnostic("payment_button_clicked", {
        product_id: productId,
        checkout_event_id: checkoutEventId,
        purchase_event_id: purchaseEventId,
        page_loaded_at_ms: PAGE_LOADED_AT_MS,
        time_on_page_before_click_ms: clickedAtMs - PAGE_LOADED_AT_MS,
        navigation: getNavigationMetrics()
      });

      const payload = {
        event_id: purchaseEventId,
        purchase_event_id: purchaseEventId,
        checkout_event_id: checkoutEventId,
        landing_id: window.APP_CONFIG?.landing_id || null,
        pixel_key: window.APP_CONFIG?.pixel_key || null,
        product_id: productId,
        event_source_url: window.location.origin + window.location.pathname,
        client_clicked_at_ms: clickedAtMs,
        page_loaded_at_ms: PAGE_LOADED_AT_MS,
        navigation: getNavigationMetrics(),
        attribution: buildAttributionPayload()
      };

      try {
        btn.textContent = "Формуємо платіж...";
        btn.disabled = true;
        btn.classList.add("is-loading");
        btn.style.pointerEvents = "none";

        const startedAt = performance.now();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        let res, data;
        try {
          res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          if (res.status >= 400 && res.status < 500) paymentAttempts.delete(productId);
          data = await res.json();
        } finally {
          clearTimeout(timeout);
        }

        if (res.ok && data.ok && data.return_url) {
          window.location.assign(data.return_url);
          return;
        }
        if (!res.ok || !data.ok || !data.payment) {
          throw new Error(data.error || "Не вдалося створити оплату");
        }

        const createOrderMs = Math.round(performance.now() - startedAt);

        trackDiagnostic("payment_order_created", {
          product_id: productId,
          order_reference: data.orderReference,
          checkout_event_id: checkoutEventId,
          purchase_event_id: purchaseEventId,
          create_order_client_ms: createOrderMs,
          server_timings: data.diagnostics || null,
          meta_checkout_sent: data.meta_checkout?.ok === true
        });

        // Старий GTM очікує custom event meta_initiate_checkout.
        // Той самий checkout_event_id передається і в браузерний Pixel, і в CAPI для дедуплікації.
        pushBrowserCheckoutEvent(
          checkoutEventId,
          data.orderReference,
          data.value,
          data.currency
        );

        // Server-side InitiateCheckout через CAPI.
        fetch(API_URL + "/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            order_reference: data.orderReference
          }),
          keepalive: true
        })
          .then(async function (response) {
            const result = await response.json();

            console.log("Meta InitiateCheckout CAPI:", {
              status: response.status,
              result: result
            });

            return result;
          })
          .catch(function (error) {
            console.error("Meta InitiateCheckout CAPI error:", error);

            return {
              ok: false,
              error: String(error)
            };
          });

        const payment = data.payment;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://secure.wayforpay.com/pay";

        Object.keys(payment).forEach(function (key) {
          const value = payment[key];

          if (Array.isArray(value)) {
            value.forEach(function (item) {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key + "[]";
              input.value = item;
              form.appendChild(input);
            });
          } else {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
          }
        });

        form.hidden = true;
        form.setAttribute("data-clarity-mask", "true");
        document.body.appendChild(form);

        trackDiagnostic("payment_form_submitted", {
          product_id: productId,
          order_reference: data.orderReference,
          checkout_event_id: checkoutEventId,
          purchase_event_id: purchaseEventId,
          total_client_ms_from_click: Date.now() - clickedAtMs
        });

        // A short delay gives the diagnostic beacon and dataLayer event time to leave the page.
        window.setTimeout(function () {
          trackDiagnostic("payment_redirect_started", {
            product_id: productId,
            order_reference: data.orderReference,
            checkout_event_id: checkoutEventId,
            purchase_event_id: purchaseEventId,
            total_client_ms_from_click: Date.now() - clickedAtMs
          });
          form.submit();
        }, 100);

      } catch (error) {
        console.error("Помилка create-order/payment:", error);

        trackDiagnostic("payment_error", {
          product_id: productId,
          checkout_event_id: checkoutEventId,
          purchase_event_id: purchaseEventId,
          message: String(error?.message || error)
        });

        restorePaymentButton?.();
        alert(localPreview
          ? "Локальний перегляд. Для перевірки оплати потрібна тестова відповідь."
          : "Не вдалося створити оплату. Спробуйте ще раз.");
      }
    });
  });
});
