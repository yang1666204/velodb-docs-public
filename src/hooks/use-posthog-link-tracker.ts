import { useEffect } from "react";

declare global {
  interface Window {
    posthog: any;
  }
}

const isDevelopment = process.env.NODE_ENV === "development";
export const INITIAL_REFERRER_STORAGE_KEY = "initial_referrer";
export default function usePostHogLinkTracker() {
  const setInitialReferrer = () => {
    let initialReferrer = sessionStorage.getItem(INITIAL_REFERRER_STORAGE_KEY);

    if (!initialReferrer) {
      // 如果存储中没有，说明这是首次进入
      const browserReferrer = document.referrer;

      if (browserReferrer) {
        // 如果 document.referrer 不为空，则存储这个值
        sessionStorage.setItem(INITIAL_REFERRER_STORAGE_KEY, browserReferrer);
        initialReferrer = browserReferrer;
      } else {
        // 如果 document.referrer 为空（用户直接访问或 Referrer Policy 限制）
        // 可以存储一个默认标记，例如 "Direct" 或 "None"
        sessionStorage.setItem(INITIAL_REFERRER_STORAGE_KEY, "Direct");
        initialReferrer = "Direct";
      }
    }
  };

  const getInitialReferrer = () => {
    if (typeof window !== "undefined") {
      const initial_referrer = sessionStorage.getItem("initial_referrer");
      return initial_referrer || document.referrer;
    }
  };

  const registerInitialReferrer = () => {
    const initialReferrer =
      sessionStorage.getItem(INITIAL_REFERRER_STORAGE_KEY) || "";
    if (typeof window !== "undefined" && window.posthog) {
      window.posthog.register({
        referrer_website: initialReferrer,
      });
    }
  };

  useEffect(() => {
    setInitialReferrer();
    registerInitialReferrer();
  }, []);

  useEffect(() => {
    const handleCloudLink = (e: any) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.href) {
        let url = new URL(anchor.href, window.location.origin);
        const isCloudUrl = url.href.includes("velodb.cloud");
        if (isCloudUrl) {
          try {
            if (isDevelopment) {
              url = new URL("https://sandbox.velodb.io");
            }
            if (typeof window !== "undefined" && window.posthog) {
              const distinctId = window.posthog.get_distinct_id();
              const sessionId = window.posthog.get_session_id();
              const initialReferrer = getInitialReferrer() || "";
              const pathname = window.location.pathname;
              if (distinctId) {
                // 阻止默认跳转，手动处理
                e.preventDefault();
                url.searchParams.set("ph_distinct_id", distinctId);
                url.searchParams.set("ph_session_id", sessionId);
                url.searchParams.set("referrer_website", initialReferrer);
                url.searchParams.set("utm_source", "docs");
                url.searchParams.set("utm_medium", pathname);
                window.open(url.toString(), anchor.target || "_self");
              }
            }
          } catch (err) {
            console.log("PostHog ID 获取失败:", err);
          }
        }
      }
    };

    // 使用事件冒泡，捕获所有动态新增的 MDX 链接
    document.addEventListener("click", handleCloudLink);

    return () => document.removeEventListener("click", handleCloudLink);
  }, []);

  return null;
}
