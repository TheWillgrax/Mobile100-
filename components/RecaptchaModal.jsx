import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { useTheme } from "../hooks/theme";

const DEFAULT_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const DEFAULT_DOMAIN = "https://autoparts-app.mobile";
const DEFAULT_LANGUAGE = "es";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

const sanitizeDomain = (domain) => {
  if (typeof domain !== "string") return DEFAULT_DOMAIN;
  try {
    const trimmed = domain.trim();
    if (!trimmed) return DEFAULT_DOMAIN;
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(`https://${trimmed}`);
    return `${url.origin}${url.pathname === "/" ? "" : url.pathname}`;
  } catch (_error) {
    return DEFAULT_DOMAIN;
  }
};

const buildHtml = (siteKey, siteDomain, language) => `<!DOCTYPE html>
<html lang="${language}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>reCAPTCHA</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #f5f5f5;
      }
      #captcha-container {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    </style>
    <script>
      (function enforceDomain() {
        try {
          var desired = "${siteDomain}";
          if (desired) {
            var normalized = desired.startsWith("http") ? desired : "https://" + desired;
            history.replaceState({}, "", normalized);
          }
        } catch (error) {
          console.warn("recaptcha domain warning", error);
        }
      })();
    </script>
    <script src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit&hl=${language}" async defer></script>
    <script>
      const sendMessage = (payload) => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      const renderCaptcha = () => {
        if (!window.grecaptcha || !window.grecaptcha.render) {
          setTimeout(renderCaptcha, 300);
          return;
        }

        try {
          const container = document.getElementById("captcha-container");
          if (!container) return;
          container.innerHTML = "";
          window.grecaptcha.render("captcha-container", {
            sitekey: "${siteKey}",
            callback: onCaptchaSuccess,
            "expired-callback": onCaptchaExpired,
            "error-callback": onCaptchaError,
          });
        } catch (error) {
          sendMessage({ type: "error", message: error?.message || "render" });
        }
      };

      window.onRecaptchaLoad = function () {
        sendMessage({ type: "loaded" });
        renderCaptcha();
      };

      window.onCaptchaSuccess = function (token) {
        sendMessage({ type: "success", token });
      };

      window.onCaptchaExpired = function () {
        sendMessage({ type: "expired" });
        renderCaptcha();
      };

      window.onCaptchaError = function (error) {
        const message =
          (typeof error === "string" && error) ||
          (error && error.message) ||
          "No se pudo inicializar el reCAPTCHA";
        sendMessage({ type: "error", message });
        renderCaptcha();
      };

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          renderCaptcha();
        }
      });
    </script>
  </head>
  <body>
    <div id="captcha-container"></div>
  </body>
</html>`;

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: "hidden",
      width: "100%",
      maxWidth: 380,
      minHeight: 160,
      borderWidth: 1,
      borderColor: theme.border,
    },
    loader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
      backgroundColor: theme.card,
      opacity: 0.85,
    },
    webview: {
      height: 220,
    },
  });

const RecaptchaModal = forwardRef(
  (
    {
      siteKey = DEFAULT_SITE_KEY,
      siteDomain = DEFAULT_DOMAIN,
      language = DEFAULT_LANGUAGE,
      onVerify,
      onExpire,
      onError,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [webviewKey, setWebviewKey] = useState(0);

    const styles = useMemo(() => createStyles(theme), [theme]);
    const sanitizedDomain = useMemo(() => sanitizeDomain(siteDomain), [siteDomain]);
    const html = useMemo(
      () => buildHtml(siteKey, sanitizedDomain, language),
      [language, sanitizedDomain, siteKey]
    );

    const open = useCallback(() => {
      setWebviewKey((key) => key + 1);
      setVisible(true);
      setLoading(true);
    }, []);

    const close = useCallback(() => {
      setVisible(false);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        open,
        close,
      }),
      [open, close]
    );

    const handleMessage = useCallback(
      (event) => {
        try {
          const data = JSON.parse(event?.nativeEvent?.data ?? "{}");
          if (data.type === "loaded") {
            setLoading(false);
          } else if (data.type === "success" && data.token) {
            onVerify?.(data.token);
            close();
          } else if (data.type === "expired") {
            onExpire?.();
          } else if (data.type === "error") {
            onError?.(data.message);
          }
        } catch (_error) {
          onError?.();
        }
      },
      [close, onError, onExpire, onVerify]
    );

    return (
      <Modal transparent animationType="fade" visible={visible} onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            {loading && (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            )}
            <WebView
              key={webviewKey}
              originWhitelist={["*"]}
              source={{ html }}
              onLoadEnd={() => setLoading(false)}
              onMessage={handleMessage}
              style={styles.webview}
              userAgent={DEFAULT_USER_AGENT}
              javaScriptEnabled
              domStorageEnabled
              setSupportMultipleWindows={false}
              mixedContentMode="always"
            />
          </View>
        </View>
      </Modal>
    );
  }
);

RecaptchaModal.displayName = "RecaptchaModal";

export default RecaptchaModal;
