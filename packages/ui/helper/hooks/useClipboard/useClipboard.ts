/**
 * Example:
 * const { copied, copy, paste } = useClipboard();
 * <button onClick={() => copy("Hello")}>{copied ? "Copied!" : "Copy"}</button>
 */

import { useState, useCallback } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState<boolean>(false);
  const [clipboardText, setClipboardText] = useState<string>("");

  const detectClipboardSupport = useCallback(() => {
    return typeof navigator !== "undefined" && !!navigator.clipboard;
  }, []);

  const fallbackCopy = useCallback((text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Keep fixed to avoid scroll
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
    document.body.removeChild(textArea);
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (!detectClipboardSupport()) {
        fallbackCopy(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Copy failed", err);
      }
    },
    [detectClipboardSupport, fallbackCopy]
  );

  const paste = useCallback(async (): Promise<string> => {
    if (!detectClipboardSupport()) return "";
    try {
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
      return text;
    } catch (err) {
      console.error("Paste failed", err);
      return "";
    }
  }, [detectClipboardSupport]);

  const copyJSON = useCallback(
    (obj: unknown) => {
      copy(JSON.stringify(obj, null, 2));
    },
    [copy]
  );

  const copyHTML = useCallback(
    async (html: string) => {
      if (!detectClipboardSupport()) return;
      try {
        const type = "text/html";
        const blob = new Blob([html], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        await navigator.clipboard.write(data);
      } catch (err) {
        console.error("Copy HTML failed", err);
      }
    },
    [detectClipboardSupport]
  );

  const copyCurrentURL = useCallback(() => {
    if (typeof window !== "undefined") {
      copy(window.location.href);
    }
  }, [copy]);

  return {
    copied,
    clipboardText,
    copy,
    paste,
    copyJSON,
    copyHTML,
    copyCurrentURL,
    detectClipboardSupport,
    fallbackCopy,
  };
}
export default useClipboard;
