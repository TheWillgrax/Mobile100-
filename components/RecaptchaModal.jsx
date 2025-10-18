import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const DEFAULT_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

const buildHtml = (siteKey) => `<!DOCTYPE html>
<html lang="es">
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
    <script src="https://www.google.com/recaptcha/api.js?hl=es" async defer></script>
    <script>
      const sendMessage = (payload) => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      window.onCaptchaSuccess = function (token) {
        sendMessage({ type: "success", token });
      };

      window.onCaptchaExpired = function () {
        sendMessage({ type: "expired" });
      };

      window.onCaptchaError = function () {
        sendMessage({ type: "error" });
      };

      document.addEventListener("DOMContentLoaded", function () {
        const renderCaptcha = () => {
          if (!window.grecaptcha) {
            setTimeout(renderCaptcha, 300);
            return;
          }

          window.grecaptcha.render("captcha-container", {
            sitekey: "${siteKey}",
            callback: "onCaptchaSuccess",
            "expired-callback": "onCaptchaExpired",
            "error-callback": "onCaptchaError",
          });
        };

        renderCaptcha();
      });
    </script>
  </head>
  <body>
    <div id="captcha-container"></div>
  </body>
</html>`;

const RecaptchaModal = forwardRef(({ siteKey = DEFAULT_SITE_KEY, onVerify, onExpire, onError }, ref) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const html = useMemo(() => buildHtml(siteKey), [siteKey]);

  const open = useCallback(() => {
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
        if (data.type === "success" && data.token) {
          onVerify?.(data.token);
          close();
        } else if (data.type === "expired") {
          onExpire?.();
        } else if (data.type === "error") {
          onError?.();
        }
      } catch (_error) {
        onError?.();
      }
    },
    [close, onError, onExpire, onVerify]
  );

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#0d6efd" />
            </View>
          )}
          <WebView
            originWhitelist={["*"]}
            source={{ html }}
            onLoadEnd={() => setLoading(false)}
            onMessage={handleMessage}
            style={styles.webview}
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    maxWidth: 380,
    minHeight: 160,
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
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  webview: {
    height: 200,
  },
});

RecaptchaModal.displayName = "RecaptchaModal";

export default RecaptchaModal;
