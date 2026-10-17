<script>
  import { createEventDispatcher } from "svelte";
  import { PenLine, X, LoaderCircle } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import linkTreeApi from "../api/linkTreeApi";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let linkTreeId = null;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
  let fetchingData = false;
  let title = "";
  let type = "public";
  let description = "";

  function handleClose() {
    dispatch("close");
    if (onClose) onClose();
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if (show && linkTreeId) {
    loadLinkTreeData(linkTreeId);
  }

  async function loadLinkTreeData(id) {
    fetchingData = true;
    try {
      const data = await linkTreeApi.getLinkTreeById(id);
      if (data) {
        title = data.title || "";
        type = data.type || "public";
        description = data.description || "";
      }
    } catch {
      showErrorDialog("Gagal mengambil data link tree");
      handleClose();
    } finally {
      fetchingData = false;
    }
  }

  $: if ($linkTreesStore.isLinkTreeChange) {
    loading = false;
    linkTreesStore.setIsLinkTreeChange(false);
    if ($linkTreesStore.isLinkTreeChanged) {
      linkTreesStore.setIsLinkTreeChanged(false);
      linkTreesStore.asyncSetLinkTrees();
      linkTreesStore.asyncSetLinkTree(linkTreeId);
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul tidak boleh kosong");
      return;
    }

    if (!description.trim()) {
      showErrorDialog("Deskripsi tidak boleh kosong");
      return;
    }

    loading = true;
    linkTreesStore.asyncSetIsLinkTreeChange(
      linkTreeId,
      title.trim(),
      type,
      description.trim()
    );
  }
</script>

{#if show}
  <div
    data-testid="edit-link-tree-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
  >
    <div
      class="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"
          >
            <PenLine size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">Ubah Data Link Tree</h3>
            <p class="text-xs text-slate-500">
              Perbarui judul, tipe visibilitas, dan deskripsi
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="close-edit-modal-btn"
          on:click={handleClose}
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Modal Form Body -->
      {#if fetchingData}
        <div class="p-12 text-center text-slate-500">
          <LoaderCircle size={32} class="animate-spin text-amber-600 mx-auto mb-2" />
          <p class="text-sm font-medium">Memuat data link tree...</p>
        </div>
      {:else}
        <form
          on:submit|preventDefault={handleSave}
          class="p-6 sm:p-8 space-y-4"
        >
          <div>
            <label
              for="edit-link-tree-title-input"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Judul Link Tree
            </label>
            <input
              id="edit-link-tree-title-input"
              type="text"
              data-testid="edit-link-tree-title-input"
              bind:value={title}
              placeholder="Masukkan judul..."
              class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              required
            />
          </div>

          <div>
            <label
              for="edit-link-tree-type-select"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Tipe Akses
            </label>
            <select
              id="edit-link-tree-type-select"
              data-testid="edit-link-tree-type-select"
              bind:value={type}
              class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
            >
              <option value="public">Publik (Terlihat oleh semua)</option>
              <option value="unlisted">Unlisted (Hanya via tautan)</option>
              <option value="private">Privat (Hanya untuk saya)</option>
            </select>
          </div>

          <div>
            <label
              for="edit-link-tree-description-input"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Deskripsi
            </label>
            <textarea
              id="edit-link-tree-description-input"
              data-testid="edit-link-tree-description-input"
              bind:value={description}
              rows="4"
              placeholder="Tuliskan deskripsi..."
              class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium resize-none"
              required
            ></textarea>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              data-testid="cancel-edit-modal-btn"
              on:click={handleClose}
              class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="submit-edit-modal-btn"
              disabled={loading}
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-md shadow-amber-600/25 transition-all disabled:opacity-60"
            >
              {#if loading}
                <LoaderCircle size={16} class="animate-spin" />
                <span>Menyimpan...</span>
              {:else}
                <PenLine size={16} strokeWidth={2.5} />
                <span>Simpan Perubahan</span>
              {/if}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

