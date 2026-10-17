import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockLinkTrees = [
    {
      id: 1,
      user_id: 1,
      title: "Pekerjaan & Portofolio",
      type: "public",
      description: "Kumpulan link portofolio dan proyek saya",
      cover: "https://example.com/cover1.jpg",
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: {
        name: "Abdullah",
        photo: "https://example.com/user.jpg",
      },
      total_links: 3,
    },
    {
      id: 2,
      user_id: 2,
      title: "Sosial Media Teman",
      type: "unlisted",
      description: "Akun sosial media",
      cover: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: {
        name: "Budi",
        photo: null,
      },
      total_links: 1,
    },
    {
      id: 3,
      user_id: 1,
      title: "Catatan Pribadi",
      type: "private",
      description: "Tautan rahasia",
      cover: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
      author: null,
      total_links: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => Promise.resolve());
  });

  it("should return null/empty if profile is not present", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.find('[data-testid="add-link-tree-btn"]').exists()).toBe(false);
  });

  it("should render link trees stats, rows, and empty state when empty", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [],
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Daftar Link Tree");
    expect(wrapper.text()).toContain("Tidak ada link tree ditemukan");
  });

  it("should display loading indicator while loading link trees", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [],
      },
    });

    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockReturnValue(new Promise(() => {}));
    const filterMeBtn = wrapper.find('[data-testid="filter-me-btn"]');
    await filterMeBtn.trigger("click");

    expect(wrapper.text()).toContain("Memuat link tree...");
  });

  it("should display stats count and filter/search link trees", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Total Link Tree");
    expect(wrapper.text()).toContain("Pekerjaan & Portofolio");
    expect(wrapper.text()).toContain("Sosial Media Teman");

    // Search filter by title
    const searchInput = wrapper.find('[data-testid="search-link-tree-input"]');
    await searchInput.setValue("Portofolio");

    expect(wrapper.text()).toContain("Pekerjaan & Portofolio");
    expect(wrapper.text()).not.toContain("Sosial Media Teman");

    // Search filter by description
    await searchInput.setValue("akun");
    expect(wrapper.text()).toContain("Sosial Media Teman");

    // Filter toggle
    const filterMeBtn = wrapper.find('[data-testid="filter-me-btn"]');
    await filterMeBtn.trigger("click");

    const filterAllBtn = wrapper.find('[data-testid="filter-all-btn"]');
    await filterAllBtn.trigger("click");
  });

  it("should handle search against link trees with null title and description", async () => {
    vi.spyOn(toolsHelper, "formatDate").mockReturnValue("-");
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [{ id: 99, title: null, description: null, type: "public", total_links: 0 }],
      },
    });
    await new Promise((r) => setTimeout(r, 20));

    const searchInput = wrapper.find('[data-testid="search-link-tree-input"]');
    await searchInput.setValue("xyz");
    expect(wrapper.text()).toContain("Tidak ada link tree ditemukan");
  });

  it("should open and close AddModal when Tambah Link Tree button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const addBtn = wrapper.find('[data-testid="add-link-tree-btn"]');
    await addBtn.trigger("click");

    expect(wrapper.find('[data-testid="add-link-tree-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="add-link-tree-modal"]').exists()).toBe(false);
  });

  it("should navigate to detail page when view link is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    navSpy.mockClear();
    await new Promise((r) => setTimeout(r, 20));

    const viewBtn = wrapper.find('[data-testid="view-link-tree-1"]');
    await viewBtn.trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/link-trees/1");
  });

  it("should open and close edit modal when edit icon clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const editBtn = wrapper.find('[data-testid="edit-link-tree-1"]');
    await editBtn.trigger("click");

    expect(wrapper.find('[data-testid="edit-link-tree-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-link-tree-modal"]').exists()).toBe(false);
  });

  it("should trigger confirm dialog and dispatch delete when delete icon confirmed", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteActionSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const deleteBtn = wrapper.find('[data-testid="delete-link-tree-1"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteActionSpy).toHaveBeenCalledWith(1);
  });

  it("should not dispatch delete when cancelled", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteActionSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const deleteBtn = wrapper.find('[data-testid="delete-link-tree-1"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    expect(deleteActionSpy).not.toHaveBeenCalled();
  });

  it("should handle delete all link trees when confirmed and cancelled", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteAll")
      .mockReturnValue(Promise.resolve());

    // Cancelled
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });
    const deleteAllBtn = wrapper.find('[data-testid="delete-all-btn"]');
    await deleteAllBtn.trigger("click");
    expect(deleteAllSpy).not.toHaveBeenCalled();

    // Confirmed
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    await deleteAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should reload link trees when isLinkTreeDeleted is true", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
        isLinkTreeDeleted: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const asyncSetTreesSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTrees")
      .mockReturnValue(Promise.resolve());

    linkTreesStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(asyncSetTreesSpy).toHaveBeenCalled();
  });

  it("should reload link trees when isLinkTreeDeletedAll is true", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockLinkTrees,
        isLinkTreeDeletedAll: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const asyncSetTreesSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTrees")
      .mockReturnValue(Promise.resolve());

    linkTreesStore.setIsLinkTreeDeletedAll(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(asyncSetTreesSpy).toHaveBeenCalled();
  });

  it("should not update loading state after unmount", async () => {
    let resolveLoad;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: [] },
    });

    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockReturnValue(pendingPromise);

    const filterMeBtn = wrapper.find('[data-testid="filter-me-btn"]');
    await filterMeBtn.trigger("click");

    wrapper.unmount();
    resolveLoad();
    await pendingPromise;
  });

  it("should handle null linkTrees in store gracefully", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: null,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Tidak ada link tree ditemukan");
  });
});

