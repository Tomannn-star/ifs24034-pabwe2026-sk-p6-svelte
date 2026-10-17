<script>
  import { createEventDispatcher } from "svelte";
  import { Link, X, LoaderCircle, Plus, PenLine } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let linkTreeId = null;
  export let item = null;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
  let title = "";
  let url = "";

  $: isEdit = !!(item && item.id);

  $: if (show) {
    if (item) {
      title = item.title || "";
      url = item.url || "";
    } else {
      title = "";
      url = "";
    }
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if ($linkTreesStore.isLinkTreeItem) {
    loading = false;
    linkTreesStore.setIsLinkTreeItem(false);
    if ($linkTreesStore.isLinkTreeItemMutated) {
      linkTreesStore.setIsLinkTreeItemMutated(false);
      linkTreesStore.asyncSetLinkTree(linkTreeId);
      title = "";
      url = "";
      handleClose();
    }
  }

  function handleClose() {
    dispatch("close");
    if (onClose) onClose();
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul tautan tidak boleh kosong");
      return;
    }

    if (!url.trim()) {
      showErrorDialog("URL tautan tidak boleh kosong");
      return;
    }

    if (!/^https?:\/\/.+/i.test(url.trim())) {
      showErrorDialog("Format URL tidak valid (harus diawali http:// atau https://)");
      return;
    }

    loading = true;
    if (isEdit) {
      linkTreesStore.asyncSetIsLinkTreeChangeItem(
        linkTreeId,
        item.id,
        title.trim(),
        url.trim()
      );
    } else {
      linkTreesStore.asyncSetIsLinkTreeAddItem(
        linkTreeId,
        title.trim(),
        url.trim()
      );
    }
  }
</script>

{#if show}
  <div
    data-testid="item-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg {isEdit
              ? 'bg-amber-100 text-amber-700'
              : 'bg-indigo-100 text-indigo-700'} flex items-center justify-center"
          >
            {#if isEdit}
              <PenLine size={18} strokeWidth={2.5} />
            {:else}
              <Plus size={18} strokeWidth={2.5} />
            {/if}
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">
              {isEdit ? "Ubah Item Tautan" : "Tambah Item Tautan Baru"}
            </h3>
            <p class="text-xs text-slate-500">
              {isEdit
                ? "Perbarui judul dan tautan URL"
                : "Masukkan judul dan alamat URL tautan"}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="close-item-modal-btn"
          on:click={handleClose}
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Modal Form Body -->
      <form on:submit|preventDefault={handleSave} class="p-6 sm:p-8 space-y-4">
        <div>
          <label
            for="item-title-input"
            class="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Judul Tautan
          </label>
          <input
            id="item-title-input"
            type="text"
            data-testid="item-title-input"
            bind:value={title}
            placeholder="Contoh: GitHub Profil, LinkedIn, Web Delcom"
            class="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
            required
          />
        </div>

        <div>
          <label
            for="item-url-input"
            class="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Alamat URL
          </label>
          <div class="relative">
            <Link
              size={18}
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="item-url-input"
              type="text"
              data-testid="item-url-input"
              bind:value={url}
              placeholder="https://example.com"
              class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              required
            />
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-item-modal-btn"
            on:click={handleClose}
            class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-item-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white {isEdit
              ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-amber-600/25'
              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/25'} shadow-md transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={16} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else if isEdit}
              <PenLine size={16} strokeWidth={2.5} />
              <span>Simpan Item</span>
            {:else}
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Item</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

