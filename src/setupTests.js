const mm = (query) => ({
  matches: false,
  media: query || "",
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
});

if (typeof window !== "undefined") {
  window.matchMedia = mm;
  try {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mm,
    });
  } catch (e) {}
}
if (typeof Window !== "undefined" && Window.prototype) {
  Window.prototype.matchMedia = mm;
}
globalThis.matchMedia = mm;

import "@testing-library/jest-dom";
import { vi, afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/svelte";

beforeEach(() => {
  if (typeof window !== "undefined") {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
});

afterEach(() => {
  cleanup();
});

if (typeof globalThis.DELCOM_BASEURL === "undefined") {
  globalThis.DELCOM_BASEURL = "https://open-api.delcom.org/api/v1";
}

if (typeof document !== "undefined") {
  if (!document.elementFromPoint) {
    document.elementFromPoint = () => null;
  }
  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () => [];
  }
  if (!Range.prototype.getBoundingClientRect) {
    Range.prototype.getBoundingClientRect = () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
    });
  }
}

const mockMatchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
});
if (typeof window !== "undefined") {
  window.matchMedia = mockMatchMedia;
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: mockMatchMedia,
  });
}
globalThis.matchMedia = mockMatchMedia;

import * as $ from "svelte/internal/client";

function DummyIcon(anchor, props) {
  let el = null;
  if (typeof document !== "undefined") {
    el = document.createElement("span");
    el.setAttribute("data-testid", "icon");
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(el, anchor);
    }
  }
  if (props) {
    try {
      $.render_effect(() => {
        for (const key of Object.getOwnPropertyNames(props)) {
          const val = props[key];
          if (el && key === "class" && val) {
            el.className = String(val);
          }
        }
      });
    } catch {
      for (const key of Object.getOwnPropertyNames(props)) {
        try {
          const val = props[key];
          if (el && key === "class" && val) el.className = String(val);
        } catch {}
      }
    }
  }
  return {};
}

vi.mock("lucide-svelte", async (importOriginal) => {
  const actual = await importOriginal();
  const mocked = {};
  for (const key of Object.keys(actual)) {
    mocked[key] = DummyIcon;
  }
  return {
    ...actual,
    ...mocked,
    default: mocked,
  };
});

vi.mock("@toast-ui/editor", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      let markdown = options?.initialValue || "";
      this.options = options;
      this.getMarkdown = vi.fn(() => markdown);
      this.setMarkdown = vi.fn((val) => {
        markdown = val;
      });
      this.destroy = vi.fn();
    }),
  };
});

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      let markdown = options?.initialValue || "";
      if (options?.el) {
        options.el.innerHTML = `<div class="toastui-editor-contents">${markdown}</div>`;
      }
      this.options = options;
      this.setMarkdown = vi.fn((val) => {
        markdown = val;
        if (options?.el) {
          options.el.innerHTML = `<div class="toastui-editor-contents">${markdown}</div>`;
        }
      });
      this.destroy = vi.fn();
    }),
  };
});

