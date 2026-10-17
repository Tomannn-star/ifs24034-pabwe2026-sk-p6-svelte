import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLinkTreesStore, linkTreesStore } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("linkTreesStore", () => {
  beforeEach(() => {
    linkTreesStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useLinkTreesStore();
    expect(store.linkTrees).toEqual([]);
    expect(store.linkTree).toBeNull();
    expect(store.isLinkTree).toBe(false);
    expect(store.isLinkTreeAdd).toBe(false);
    expect(store.isLinkTreeAdded).toBe(false);
    expect(store.isLinkTreeChange).toBe(false);
    expect(store.isLinkTreeChanged).toBe(false);
    expect(store.isLinkTreeChangeCover).toBe(false);
    expect(store.isLinkTreeChangedCover).toBe(false);
    expect(store.isLinkTreeDelete).toBe(false);
    expect(store.isLinkTreeDeleted).toBe(false);
    expect(store.isLinkTreeDeleteAll).toBe(false);
    expect(store.isLinkTreeDeletedAll).toBe(false);
    expect(store.isLinkTreeItem).toBe(false);
    expect(store.isLinkTreeItemMutated).toBe(false);
  });

  it("should update state with setters", () => {
    const store = useLinkTreesStore();
    store.setLinkTrees([{ id: 1 }]);
    expect(store.linkTrees).toEqual([{ id: 1 }]);

    store.setLinkTree({ id: 1 });
    expect(store.linkTree).toEqual({ id: 1 });

    store.setIsLinkTree(true);
    expect(store.isLinkTree).toBe(true);

    store.setIsLinkTreeAdd(true);
    expect(store.isLinkTreeAdd).toBe(true);

    store.setIsLinkTreeAdded(true);
    expect(store.isLinkTreeAdded).toBe(true);

    store.setIsLinkTreeChange(true);
    expect(store.isLinkTreeChange).toBe(true);

    store.setIsLinkTreeChanged(true);
    expect(store.isLinkTreeChanged).toBe(true);

    store.setIsLinkTreeChangeCover(true);
    expect(store.isLinkTreeChangeCover).toBe(true);

    store.setIsLinkTreeChangedCover(true);
    expect(store.isLinkTreeChangedCover).toBe(true);

    store.setIsLinkTreeDelete(true);
    expect(store.isLinkTreeDelete).toBe(true);

    store.setIsLinkTreeDeleted(true);
    expect(store.isLinkTreeDeleted).toBe(true);

    store.setIsLinkTreeDeleteAll(true);
    expect(store.isLinkTreeDeleteAll).toBe(true);

    store.setIsLinkTreeDeletedAll(true);
    expect(store.isLinkTreeDeletedAll).toBe(true);

    store.setIsLinkTreeItem(true);
    expect(store.isLinkTreeItem).toBe(true);

    store.setIsLinkTreeItemMutated(true);
    expect(store.isLinkTreeItemMutated).toBe(true);
  });

  describe("asyncSetLinkTrees", () => {
    it("should set linkTrees on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([{ id: 1 }]);

      await store.asyncSetLinkTrees("1");
      expect(store.linkTrees).toEqual([{ id: 1 }]);
    });

    it("should set empty array on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("Err"));

      await store.asyncSetLinkTrees();
      expect(store.linkTrees).toEqual([]);
    });
  });

  describe("asyncSetLinkTree", () => {
    it("should set linkTree and setIsLinkTree on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({ id: 1 });

      await store.asyncSetLinkTree(1);
      expect(store.linkTree).toEqual({ id: 1 });
      expect(store.isLinkTree).toBe(true);
    });

    it("should set null and setIsLinkTree on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("Err"));

      await store.asyncSetLinkTree(99);
      expect(store.linkTree).toBeNull();
      expect(store.isLinkTree).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeAdd", () => {
    it("should add link tree successfully", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTree").mockResolvedValue({ link_tree_id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeAdd("Title", "public", "Desc");

      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil ditambahkan!");
      expect(store.isLinkTreeAdded).toBe(true);
      expect(store.isLinkTreeAdd).toBe(true);
    });

    it("should handle error when adding link tree", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTree").mockRejectedValue(new Error("Fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeAdd("Title", "public", "Desc");

      expect(errorSpy).toHaveBeenCalledWith("Fail");
      expect(store.isLinkTreeAdded).toBe(false);
      expect(store.isLinkTreeAdd).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChange", () => {
    it("should update link tree successfully", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("Berhasil mengubah data");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeChange(1, "New Title", "private", "New Desc");

      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah data");
      expect(store.isLinkTreeChanged).toBe(true);
      expect(store.isLinkTreeChange).toBe(true);
    });

    it("should use fallback success message when api returns empty string", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeChange(1, "Title", "public", "Desc");

      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil diperbarui!");
      expect(store.isLinkTreeChanged).toBe(true);
    });

    it("should handle error when updating link tree", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTree").mockRejectedValue(new Error("Update fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeChange(1, "Title", "public", "Desc");

      expect(errorSpy).toHaveBeenCalledWith("Update fail");
      expect(store.isLinkTreeChanged).toBe(false);
      expect(store.isLinkTreeChange).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChangeCover", () => {
    it("should change cover successfully", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("Berhasil mengubah cover");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "c.jpg");
      await store.asyncSetIsLinkTreeChangeCover(1, dummyFile);

      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah cover");
      expect(store.isLinkTreeChangedCover).toBe(true);
      expect(store.isLinkTreeChangeCover).toBe(true);
    });

    it("should use fallback success message when empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "c.jpg");
      await store.asyncSetIsLinkTreeChangeCover(1, dummyFile);

      expect(successSpy).toHaveBeenCalledWith("Cover berhasil diperbarui!");
      expect(store.isLinkTreeChangedCover).toBe(true);
    });

    it("should handle error when changing cover", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockRejectedValue(new Error("Upload fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "c.jpg");
      await store.asyncSetIsLinkTreeChangeCover(1, dummyFile);

      expect(errorSpy).toHaveBeenCalledWith("Upload fail");
      expect(store.isLinkTreeChangedCover).toBe(false);
      expect(store.isLinkTreeChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDelete", () => {
    it("should delete link tree successfully", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("Berhasil menghapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDelete(1);

      expect(successSpy).toHaveBeenCalledWith("Berhasil menghapus");
      expect(store.isLinkTreeDeleted).toBe(true);
      expect(store.isLinkTreeDelete).toBe(true);
    });

    it("should use fallback success message when empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDelete(1);

      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil dihapus!");
      expect(store.isLinkTreeDeleted).toBe(true);
    });

    it("should handle error when deleting link tree", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockRejectedValue(new Error("Delete fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDelete(1);

      expect(errorSpy).toHaveBeenCalledWith("Delete fail");
      expect(store.isLinkTreeDeleted).toBe(false);
      expect(store.isLinkTreeDelete).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDeleteAll", () => {
    it("should delete all link trees successfully", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("Semua terhapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDeleteAll();

      expect(successSpy).toHaveBeenCalledWith("Semua terhapus");
      expect(store.isLinkTreeDeletedAll).toBe(true);
      expect(store.isLinkTreeDeleteAll).toBe(true);
    });

    it("should use fallback success message when empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDeleteAll();

      expect(successSpy).toHaveBeenCalledWith("Semua link tree berhasil dihapus!");
      expect(store.isLinkTreeDeletedAll).toBe(true);
    });

    it("should handle error when deleting all link trees", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockRejectedValue(new Error("Fail"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDeleteAll();

      expect(errorSpy).toHaveBeenCalledWith("Fail");
      expect(store.isLinkTreeDeletedAll).toBe(false);
      expect(store.isLinkTreeDeleteAll).toBe(true);
    });
  });

  describe("item mutation methods", () => {
    describe("asyncSetIsLinkTreeAddItem", () => {
      it("should add item successfully", async () => {
        const store = useLinkTreesStore();
        vi.spyOn(linkTreeApi, "postLinkTreeItem").mockResolvedValue({ item_id: 1 });
        const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

        await store.asyncSetIsLinkTreeAddItem(1, "Web", "https://delcom.org");

        expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil ditambahkan!");
        expect(store.isLinkTreeItemMutated).toBe(true);
        expect(store.isLinkTreeItem).toBe(true);
      });

      it("should handle error when adding item", async () => {
        const store = useLinkTreesStore();
        vi.spyOn(linkTreeApi, "postLinkTreeItem").mockRejectedValue(new Error("Invalid"));
        const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

        await store.asyncSetIsLinkTreeAddItem(1, "Web", "invalid");

        expect(errorSpy).toHaveBeenCalledWith("Invalid");
        expect(store.isLinkTreeItemMutated).toBe(false);
        expect(store.isLinkTreeItem).toBe(true);
      });
    });

    describe("asyncSetIsLinkTreeChangeItem", () => {
      it("should update item successfully", async () => {
        const store = useLinkTreesStore();
        vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("Berhasil");
        const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

        await store.asyncSetIsLinkTreeChangeItem(1, 2, "Web", "https://delcom.org");

        expect(successSpy).toHaveBeenCalledWith("Berhasil");
        expect(store.isLinkTreeItemMutated).toBe(true);
        expect(store.isLinkTreeItem).toBe(true);
      });

      it("should use fallback success message when empty", async () => {
        const store = useLinkTreesStore();
        vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("");
        const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

        await store.asyncSetIsLinkTreeChangeItem(1, 2, "Web", "https://delcom.org");

        expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil diperbarui!");
        expect(store.isLinkTreeItemMutated).toBe(true);
      });

      it("should handle error when updating item", async () => {
        const store = useLinkTreesStore();
        vi.spyOn(linkTreeApi, "putLinkTreeItem").mockRejectedValue(new Error("Update fail"));
        const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

        await store.asyncSetIsLinkTreeChangeItem(1, 2, "Web", "invalid");

        expect(errorSpy).toHaveBeenCalledWith("Update fail");
        expect(store.isLinkTreeItemMutated).toBe(false);
        expect(store.isLinkTreeItem).toBe(true);
      });
    });

    describe("asyncSetIsLinkTreeDeleteItem", () => {
      it("should delete item successfully", async () => {
        const store = useLinkTreesStore();
        vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("Berhasil dihapus");
        const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

        await store.asyncSetIsLinkTreeDeleteItem(1, 2);

        expect(successSpy).toHaveBeenCalledWith("Berhasil dihapus");
        expect(store.isLinkTreeItemMutated).toBe(true);
        expect(store.isLinkTreeItem).toBe(true);
      });

      it("should use fallback success message when empty", async () => {
        const store = useLinkTreesStore();
        vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("");
        const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

        await store.asyncSetIsLinkTreeDeleteItem(1, 2);

        expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil dihapus!");
        expect(store.isLinkTreeItemMutated).toBe(true);
      });

      it("should handle error when deleting item", async () => {
        const store = useLinkTreesStore();
        vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockRejectedValue(new Error("Delete fail"));
        const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

        await store.asyncSetIsLinkTreeDeleteItem(1, 2);

        expect(errorSpy).toHaveBeenCalledWith("Delete fail");
        expect(store.isLinkTreeItemMutated).toBe(false);
        expect(store.isLinkTreeItem).toBe(true);
      });
    });
  });
});

