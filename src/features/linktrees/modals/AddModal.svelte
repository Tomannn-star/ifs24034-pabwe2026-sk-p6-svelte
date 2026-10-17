<script>
  import { createEventDispatcher } from "svelte";
  import { Plus, X, LoaderCircle } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
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

  $: if ($linkTreesStore.isLinkTreeAdd) {
    loading = false;
    linkTreesStore.setIsLinkTreeAdd(false);
    if ($linkTreesStore.isLinkTreeAdded) {
      linkTreesStore.setIsLinkTreeAdded(false);
      linkTreesStore.asyncSetLinkTrees();
      title = "";
      type = "public";
      description = "";
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
    linkTreesStore.asyncSetIsLinkTreeAdd(title.trim(), type, description.trim());
  }
</script>

{#if show}
  <div
    data-testid="add-link-tree-modal"
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
            class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center"
          >
            <Plus size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">Tambah Link Tree Baru</h3>
            <p class="text-xs text-slate-500">
              Buat halaman kumpulan tautan baru
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="close-add-modal-btn"
          on:click={handleClose}
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Modal Form Body -->
      <form
        on:submit|preventDefault={handleSave}
        class="p-6 sm:p-8 space-y-4"
      >
        <div>
          <label
            for="add-link-tree-title-input"
            class="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Judul Link Tree
          </label>
          <input
            id="add-link-tree-title-input"
            type="text"
            data-testid="add-link-tree-title-input"
            bind:value={title}
            placeholder="Masukkan judul kumpulan tautan..."
            class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
            required
          />
        </div>

        <div>
          <label
            for="add-link-tree-type-select"
            class="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Tipe Akses
          </label>
          <select
            id="add-link-tree-type-select"
            data-testid="add-link-tree-type-select"
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
            for="add-link-tree-description-input"
            class="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Deskripsi
          </label>
          <textarea
            id="add-link-tree-description-input"
            data-testid="add-link-tree-description-input"
            bind:value={description}
            rows="4"
            placeholder="Tuliskan deskripsi kumpulan tautan ini..."
            class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium resize-none"
            required
          ></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-add-modal-btn"
            on:click={handleClose}
            class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-add-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={16} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else}
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Link Tree</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

