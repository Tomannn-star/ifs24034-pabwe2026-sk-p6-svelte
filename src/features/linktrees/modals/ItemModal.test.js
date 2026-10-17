import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ItemModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: false, linkTreeId: 1 },
    });
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should populate inputs when editing an existing item", () => {
    const mockItem = { id: 2, title: "My GitHub", url: "https://github.com" };
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');

    expect(titleInput.element.value).toBe("My GitHub");
    expect(urlInput.element.value).toBe("https://github.com");
  });

  it("should validate empty title", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");
  });

  it("should validate empty url", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Title Test");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("URL tautan tidak boleh kosong");
  });

  it("should validate invalid url scheme", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    await titleInput.setValue("Title Test");
    await urlInput.setValue("ftp://invalid-url.com");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Format URL tidak valid (harus diawali http:// atau https://)");
  });

  it("should submit new item when not editing", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null, onClose: closeSpy },
      preloadedState: {
        isLinkTreeItem: false,
        isLinkTreeItemMutated: false,
      },
    });

    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeAddItem").mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    await titleInput.setValue("Delcom Org");
    await urlInput.setValue("https://delcom.org");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(1, "Delcom Org", "https://delcom.org");

    // Simulate completion
    linkTreesStore.setIsLinkTreeItem(true);
    linkTreesStore.setIsLinkTreeItemMutated(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should submit edited item when editing", async () => {
    const closeSpy = vi.fn();
    const mockItem = { id: 5, title: "Old Title", url: "https://old.com" };
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem, onClose: closeSpy },
      preloadedState: {
        isLinkTreeItem: false,
        isLinkTreeItemMutated: false,
      },
    });

    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeChangeItem").mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    await titleInput.setValue("Updated Title");
    await urlInput.setValue("https://new.com");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, 5, "Updated Title", "https://new.com");
  });

  it("should handle isLinkTreeItem true when isLinkTreeItemMutated is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
      preloadedState: {
        isLinkTreeItem: false,
        isLinkTreeItemMutated: false,
      },
    });

    linkTreesStore.setIsLinkTreeItem(true);
    linkTreesStore.setIsLinkTreeItemMutated(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should trigger onClose on cancel or close button click", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-item-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without callback", async () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.exists()).toBe(true);
  });

  it("should handle item with empty/null title and url fallback", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: {
        show: true,
        linkTreeId: 1,
        item: { id: 10, title: null, url: null },
      },
    });
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("");
  });
});

