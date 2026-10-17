<script>
  import { createEventDispatcher } from "svelte";
  import { ImagePlus, X, LoaderCircle, Upload } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let linkTree = null;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
  let file = null;
  let previewUrl = null;

  function handleClose() {
    previewUrl = null;
    file = null;
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

  $: if ($linkTreesStore.isLinkTreeChangeCover) {
    loading = false;
    linkTreesStore.setIsLinkTreeChangeCover(false);
    if ($linkTreesStore.isLinkTreeChangedCover) {
      linkTreesStore.setIsLinkTreeChangedCover(false);
      linkTreesStore.asyncSetLinkTree(linkTree.id);
      handleClose();
    }
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      showErrorDialog("Pilih file gambar (JPG/PNG)!");
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      showErrorDialog("Ukuran gambar maksimal 1MB!");
      return;
    }

    file = selectedFile;
    previewUrl = URL.createObjectURL(selectedFile);
  }

  function handleSave() {
    if (!file) {
      showErrorDialog("Silakan pilih cover baru!");
      return;
    }

    loading = true;
    linkTreesStore.asyncSetIsLinkTreeChangeCover(linkTree.id, file);
  }
</script>

{#if show && linkTree}
  <div
    data-testid="change-cover-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <ImagePlus size={18} strokeWidth={2.5} />
          </div>
          <h3 class="text-base font-bold text-slate-800">Ubah Cover Link Tree</h3>
        </div>
        <button
          type="button"
          data-testid="close-cover-modal-btn"
          on:click={handleClose}
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <span class="block text-sm font-semibold text-slate-700 mb-2">
            Pilih Gambar Cover
          </span>
          <label
            data-testid="file-upload-label"
            class="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-center"
          >
            {#if previewUrl}
              <img
                src={previewUrl}
                alt="Preview"
                class="w-full h-36 object-cover rounded-xl mb-2"
              />
              <span class="text-xs font-semibold text-indigo-600">Klik untuk mengganti gambar</span>
            {:else if linkTree.cover}
              <img
                src={linkTree.cover}
                alt="Current Cover"
                class="w-full h-36 object-cover rounded-xl mb-2 opacity-80"
              />
              <span class="text-xs font-semibold text-slate-600">Klik untuk memilih gambar baru</span>
            {:else}
              <div class="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-400 mb-2">
                <Upload size={22} />
              </div>
              <span class="text-sm font-bold text-slate-700">Pilih dari Komputer</span>
              <span class="text-xs text-slate-400 mt-0.5">PNG atau JPG (Maks. 1MB)</span>
            {/if}
            <input
              type="file"
              data-testid="cover-file-input"
              accept="image/*"
              on:change={handleFileChange}
              class="hidden"
            />
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-cover-modal-btn"
            on:click={handleClose}
            class="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-cover-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-md shadow-sky-600/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={16} class="animate-spin" />
              <span>Mengunggah...</span>
            {:else}
              <Upload size={16} />
              <span>Unggah Cover</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

