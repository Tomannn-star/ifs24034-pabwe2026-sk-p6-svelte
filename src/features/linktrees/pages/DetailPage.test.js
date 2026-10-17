import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as router from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockLinkTree = {
    id: 1,
    user_id: 1,
    title: "Link Tree Utama",
    type: "public",
    description: "Kumpulan link akun sosial media saya",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    user: { id: 1, name: "Abdullah" },
    items: [
      { id: 101, title: "GitHub", url: "https://github.com" },
      { id: 102, title: "LinkedIn", url: "https://linkedin.com" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading spinner if profile or linkTree is missing", () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: null,
        linkTree: null,
      },
    });

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });
    expect(wrapper2.find('[data-testid="loading-spinner"]').exists()).toBe(true);
  });

  it("should not call asyncSetLinkTree if linkTreeId is not provided onMount", () => {
    const spy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    renderWithProviders(DetailPage, {
      props: { linkTreeId: null },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("should render link tree details correctly and support modals", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    expect(wrapper.text()).toContain("Link Tree Utama");
    expect(wrapper.text()).toContain("Publik");
    expect(wrapper.text()).toContain("GitHub");
    expect(wrapper.text()).toContain("LinkedIn");

    // Back to linktrees link
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const backLink = wrapper.find('[data-testid="back-to-linktrees-link"]');
    await backLink.trigger("click");
    expect(navigateSpy).toHaveBeenCalledWith("/");

    // Open & close cover modal
    const editCoverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    await editCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const closeCoverBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    // Open & close edit modal
    const editDetailBtn = wrapper.find('[data-testid="edit-detail-linktree-btn"]');
    await editDetailBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-link-tree-modal"]').exists()).toBe(true);

    const closeEditBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeEditBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-link-tree-modal"]').exists()).toBe(false);

    // Open & close add item modal
    const addItemBtn = wrapper.find('[data-testid="add-item-btn"]');
    await addItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);

    const closeItemBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);

    // Open edit item modal
    const editItemBtn = wrapper.find('[data-testid="edit-item-btn-101"]');
    await editItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Ubah Item Tautan");
  });

  it("should render badges and fallbacks for unlisted and private types, author fallback, empty description, empty items", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 2 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          type: "unlisted",
          description: "",
          cover: null,
          user: null,
          author: "Budi Author",
          items: [],
        },
      },
    });

    expect(wrapper.text()).toContain("Unlisted");
    expect(wrapper.text()).toContain("Pemilik: Budi Author");
    expect(wrapper.text()).toContain("Tidak ada deskripsi rinci untuk link tree ini.");
    expect(wrapper.find('[data-testid="empty-items-state"]').exists()).toBe(true);

    // Click add-first-item-btn
    const addFirstBtn = wrapper.find('[data-testid="add-first-item-btn"]');
    await addFirstBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);

    // Render private badge
    const { wrapper: wrapperPrivate } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 3 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          type: "private",
          author: null,
          user: null,
        },
      },
    });
    expect(wrapperPrivate.text()).toContain("Privat");
  });

  it("should hide owner actions when user is not owner", () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          user_id: 999,
          user: { id: 999, name: "Other User" },
        },
      },
    });

    expect(wrapper.find('[data-testid="edit-cover-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="edit-detail-linktree-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="delete-detail-linktree-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="add-item-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="edit-item-btn-101"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="delete-item-btn-101"]').exists()).toBe(false);
  });

  it("should handle link tree deletion confirmation flow", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    // Cancelled
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    await wrapper.find('[data-testid="delete-detail-linktree-btn"]').trigger("click");
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirmed
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    await wrapper.find('[data-testid="delete-detail-linktree-btn"]').trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should handle link tree item deletion confirmation flow", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteItem")
      .mockReturnValue(Promise.resolve());

    // Cancelled
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    await wrapper.find('[data-testid="delete-item-btn-101"]').trigger("click");
    expect(deleteItemSpy).not.toHaveBeenCalled();

    // Confirmed
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    await wrapper.find('[data-testid="delete-item-btn-101"]').trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteItemSpy).toHaveBeenCalledWith(1, 101);
  });

  it("should navigate back to home if isLinkTree is true and linkTree is null", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { linkTreesStore: ltStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
        isLinkTree: false,
      },
    });

    ltStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should stay on page when isLinkTree is true and linkTree exists", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { wrapper, linkTreesStore: ltStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
        isLinkTree: false,
      },
    });

    navigateSpy.mockClear();
    ltStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Link Tree Utama");
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("should navigate back to home if isLinkTreeDeleted is true", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { linkTreesStore: ltStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
        isLinkTreeDeleted: false,
      },
    });

    ltStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should trigger asyncSetLinkTree on linkTreeId prop change", async () => {
    const setLinkTreeSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTree")
      .mockImplementation(() => Promise.resolve());
    const { rerender } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    await rerender({ linkTreeId: 2 });
    await new Promise((r) => setTimeout(r, 10));

    expect(setLinkTreeSpy).toHaveBeenCalledWith(2);
  });

  it("should hide add-first-item button when items is empty and user is not owner", () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          user_id: 999,
          items: [],
        },
      },
    });

    expect(wrapper.find('[data-testid="empty-items-state"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-first-item-btn"]').exists()).toBe(false);
  });
});

