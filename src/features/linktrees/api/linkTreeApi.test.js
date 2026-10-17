import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreeApi from "./linkTreeApi";
import apiHelper from "../../../helpers/apiHelper";

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postLinkTree", () => {
    it("should create new link tree and return data", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_tree_id: 10 },
        }),
      });

      const res = await linkTreeApi.postLinkTree("Title", "public", "Description");
      expect(res).toEqual({ link_tree_id: 10 });
    });

    it("should throw error if creation fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      });

      await expect(linkTreeApi.postLinkTree("", "public", "")).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.postLinkTree("", "public", "")).rejects.toThrow("Gagal menambahkan link tree");
    });
  });

  describe("postLinkTreeCover", () => {
    it("should upload cover with FormData and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah cover",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      const msg = await linkTreeApi.postLinkTreeCover(1, dummyFile);
      expect(msg).toBe("Berhasil mengubah cover");
    });

    it("should handle cover file without name property properly", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil",
        }),
      });

      const dummyBlob = new Blob(["dummy"], { type: "image/jpeg" });
      const msg = await linkTreeApi.postLinkTreeCover(1, dummyBlob);
      expect(msg).toBe("Berhasil");
    });

    it("should throw error on upload cover fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Format tidak didukung",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(linkTreeApi.postLinkTreeCover(1, dummyFile)).rejects.toThrow("Format tidak didukung");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(linkTreeApi.postLinkTreeCover(1, dummyFile)).rejects.toThrow("Gagal mengubah cover link tree");
    });
  });

  describe("putLinkTree", () => {
    it("should update link tree and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      });

      const msg = await linkTreeApi.putLinkTree(1, "New Title", "private", "New Desc");
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should throw error when update fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      });

      await expect(linkTreeApi.putLinkTree(1, "", "public", "")).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.putLinkTree(1, "", "public", "")).rejects.toThrow("Gagal mengubah link tree");
    });
  });

  describe("getLinkTrees", () => {
    it("should fetch link trees with is_me parameter", async () => {
      const mockList = [{ id: 1, title: "My Link Tree" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_trees: mockList },
        }),
      });

      const list = await linkTreeApi.getLinkTrees("1");
      expect(list).toEqual(mockList);
    });

    it("should fetch all link trees without parameter", async () => {
      const mockList = [{ id: 2, title: "Public Link Tree" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_trees: mockList },
        }),
      });

      const list = await linkTreeApi.getLinkTrees();
      expect(list).toEqual(mockList);
    });

    it("should return empty array if data.link_trees is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {},
        }),
      });

      const list = await linkTreeApi.getLinkTrees();
      expect(list).toEqual([]);
    });

    it("should throw error when api status is fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal memuat link tree",
        }),
      });

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Gagal memuat link tree");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Gagal mengambil data link tree");
    });
  });

  describe("getLinkTreeById", () => {
    it("should return link tree detail on success", async () => {
      const mockItem = { id: 1, title: "Tree 1", items: [] };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_tree: mockItem },
        }),
      });

      const res = await linkTreeApi.getLinkTreeById(1);
      expect(res).toEqual(mockItem);
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Link tree tidak ditemukan",
        }),
      });

      await expect(linkTreeApi.getLinkTreeById(99)).rejects.toThrow("Link tree tidak ditemukan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.getLinkTreeById(99)).rejects.toThrow("Gagal mengambil detail link tree");
    });
  });

  describe("deleteLinkTree", () => {
    it("should delete link tree and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus data",
        }),
      });

      const msg = await linkTreeApi.deleteLinkTree(1);
      expect(msg).toBe("Berhasil menghapus data");
    });

    it("should throw error when delete fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus",
        }),
      });

      await expect(linkTreeApi.deleteLinkTree(1)).rejects.toThrow("Gagal menghapus");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.deleteLinkTree(1)).rejects.toThrow("Gagal menghapus link tree");
    });
  });

  describe("deleteAllLinkTrees", () => {
    it("should delete all link trees and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus semua data link tree",
        }),
      });

      const msg = await linkTreeApi.deleteAllLinkTrees();
      expect(msg).toBe("Berhasil menghapus semua data link tree");
    });

    it("should throw error when delete all fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Unauthenticated.",
        }),
      });

      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow("Unauthenticated.");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow("Gagal menghapus semua data link tree");
    });
  });

  describe("item operations", () => {
    describe("postLinkTreeItem", () => {
      it("should add item and return data", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "success",
            data: { item_id: 1 },
          }),
        });

        const res = await linkTreeApi.postLinkTreeItem(1, "Website", "https://delcom.org");
        expect(res).toEqual({ item_id: 1 });
      });

      it("should throw error on failure", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "fail",
            message: "URL tidak valid",
          }),
        });

        await expect(linkTreeApi.postLinkTreeItem(1, "Web", "invalid")).rejects.toThrow("URL tidak valid");
      });

      it("should use fallback message on failure", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "fail",
          }),
        });

        await expect(linkTreeApi.postLinkTreeItem(1, "Web", "invalid")).rejects.toThrow("Gagal menambahkan item link tree");
      });
    });

    describe("putLinkTreeItem", () => {
      it("should update item and return message", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "success",
            message: "Berhasil mengubah data",
          }),
        });

        const msg = await linkTreeApi.putLinkTreeItem(1, 2, "Website Baru", "https://delcom.org");
        expect(msg).toBe("Berhasil mengubah data");
      });

      it("should throw error on failure", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "fail",
            message: "Gagal mengubah item",
          }),
        });

        await expect(linkTreeApi.putLinkTreeItem(1, 2, "Web", "invalid")).rejects.toThrow("Gagal mengubah item");
      });

      it("should use fallback message on failure", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "fail",
          }),
        });

        await expect(linkTreeApi.putLinkTreeItem(1, 2, "Web", "invalid")).rejects.toThrow("Gagal mengubah item link tree");
      });
    });

    describe("deleteLinkTreeItem", () => {
      it("should delete item and return message", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "success",
            message: "Berhasil menghapus data",
          }),
        });

        const msg = await linkTreeApi.deleteLinkTreeItem(1, 2);
        expect(msg).toBe("Berhasil menghapus data");
      });

      it("should throw error on failure", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "fail",
            message: "Item tidak ditemukan",
          }),
        });

        await expect(linkTreeApi.deleteLinkTreeItem(1, 2)).rejects.toThrow("Item tidak ditemukan");
      });

      it("should use fallback message on failure", async () => {
        vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
          json: async () => ({
            status: "fail",
          }),
        });

        await expect(linkTreeApi.deleteLinkTreeItem(1, 2)).rejects.toThrow("Gagal menghapus item link tree");
      });
    });
  });
});

