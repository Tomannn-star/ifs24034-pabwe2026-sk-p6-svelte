<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import AddModal from "../modals/AddModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    Plus,
    Link,
    Search,
    Globe,
    EyeOff,
    Lock,
    Eye,
    Pencil,
    Trash2,
    Calendar,
    LoaderCircle,
    Layers,
    ExternalLink,
  } from "lucide-svelte";

  let loadingLinkTrees = false;
  let filter = ""; // "" for Semua, "1" for Milik Saya
  let searchQuery = "";
  let showAddModal = false;
  let showChangeModal = false;
  let selectedLinkTreeId = null;

  $: profile = $usersStore.profile;
  $: linkTrees = $linkTreesStore.linkTrees || [];

  onMount(() => {
    loadLinkTrees();
  });

  function loadLinkTrees() {
    loadingLinkTrees = true;
    Promise.resolve(linkTreesStore.asyncSetLinkTrees(filter)).finally(() => {
      loadingLinkTrees = false;
    });
  }

  let prevFilter = filter;
  $: if (filter !== prevFilter) {
    prevFilter = filter;
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeletedAll) {
    linkTreesStore.setIsLinkTreeDeletedAll(false);
    loadLinkTrees();
  }

  function handleEditLinkTree(id) {
    selectedLinkTreeId = id;
    showChangeModal = true;
  }

  async function handleDeleteLinkTree(id) {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus link tree ini?"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDelete(id);
    }
  }

  async function handleDeleteAll() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus semua link tree milik Anda? Tindakan ini tidak dapat dibatalkan!"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDeleteAll();
    }
  }

  $: filteredLinkTrees = linkTrees.filter((tree) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = tree.title ? tree.title.toLowerCase() : "";
    const description = tree.description ? tree.description.toLowerCase() : "";
    return title.includes(q) || description.includes(q);
  });

  $: totalTrees = linkTrees.length;
  $: totalLinksCount = linkTrees.reduce((acc, curr) => acc + (curr.total_links || 0), 0);
  $: publicTrees = linkTrees.filter((t) => t.type === "public").length;
</script>

{#if profile}
  <div class="space-y-8 animate-in fade-in duration-300">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Link Tree
        </h1>
        <p class="text-sm text-slate-600 mt-1">
          Kelola dan bagikan kumpulan tautan penting Anda dalam satu halaman terpadu.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        {#if linkTrees.some((t) => t.user_id === profile.id)}
          <button
            type="button"
            data-testid="delete-all-btn"
            on:click={handleDeleteAll}
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all"
          >
            <Trash2 size={16} />
            <span>Hapus Semua</span>
          </button>
        {/if}

        <button
          type="button"
          data-testid="add-link-tree-btn"
          on:click={() => (showAddModal = true)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Link Tree</span>
        </button>
      </div>
    </div>

    <!-- Statistik Ringkas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Layers size={22} />
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Link Tree</p>
          <p class="text-2xl font-black text-slate-900 mt-0.5">{totalTrees}</p>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Globe size={22} />
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Publik</p>
          <p class="text-2xl font-black text-slate-900 mt-0.5">{publicTrees}</p>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          <Link size={22} />
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Tautan</p>
          <p class="text-2xl font-black text-slate-900 mt-0.5">{totalLinksCount}</p>
        </div>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <Search size={18} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          data-testid="search-link-tree-input"
          bind:value={searchQuery}
          placeholder="Cari link tree..."
          class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
        />
      </div>

      <!-- Segmented Buttons for is_me filter -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
        <button
          type="button"
          data-testid="filter-all-btn"
          on:click={() => (filter = "")}
          class="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all {filter === ''
            ? 'bg-white text-indigo-700 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'}"
        >
          Semua
        </button>
        <button
          type="button"
          data-testid="filter-me-btn"
          on:click={() => (filter = "1")}
          class="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all {filter === '1'
            ? 'bg-white text-indigo-700 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'}"
        >
          Milik Saya
        </button>
      </div>
    </div>

    <!-- List Grid of Link Trees -->
    {#if loadingLinkTrees && filteredLinkTrees.length === 0}
      <div class="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
        <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
        <p class="font-medium text-slate-600">Memuat link tree...</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredLinkTrees as tree}
          <div
            data-testid={`link-tree-card-${tree.id}`}
            class="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
          >
            <!-- Card Cover Image Header -->
            <div class="relative h-44 bg-slate-900 overflow-hidden">
              {#if tree.cover}
                <img
                  src={tree.cover && tree.cover.includes("delcom.org")
                    ? `/_vercel/image?url=${encodeURIComponent("https://open-api.delcom.org" + tree.cover.replace("https://open-api.delcom.org", ""))}&w=320&q=75`
                    : tree.cover}
                  alt={tree.title}
                  width="320"
                  height="176"
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              {:else}
                <div class="w-full h-full bg-gradient-to-tr from-slate-800 to-indigo-950 flex items-center justify-center text-indigo-300/40">
                  <Link size={48} />
                </div>
              {/if}

              <!-- Visibility Badge -->
              <div class="absolute top-3 left-3">
                {#if tree.type === 'public'}
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-emerald-700 shadow-xs">
                    <Globe size={13} />
                    Publik
                  </span>
                {:else if tree.type === 'unlisted'}
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-amber-700 shadow-xs">
                    <EyeOff size={13} />
                    Unlisted
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-rose-700 shadow-xs">
                    <Lock size={13} />
                    Privat
                  </span>
                {/if}
              </div>

              <!-- Total Links Badge -->
              <div class="absolute bottom-3 right-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-xs text-white">
                  <Link size={12} />
                  {tree.total_links} tautan
                </span>
              </div>
            </div>

            <!-- Card Body Content -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h2 class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {tree.title}
                </h2>
                <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {tree.description || "Tidak ada deskripsi."}
                </p>
              </div>

              <!-- Author & Date -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div class="flex items-center gap-2 min-w-0">
                  {#if tree.author && tree.author.photo}
                    <img
                      src={tree.author.photo.replace("https://open-api.delcom.org", "")}
                      alt={tree.author.name}
                      class="w-6 h-6 rounded-full object-cover shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                  {:else}
                    <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {tree.author && tree.author.name ? tree.author.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  {/if}
                  <span class="font-medium text-slate-600 truncate">{tree.author ? tree.author.name : "Pengguna"}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <Calendar size={13} />
                  <span>{formatDate(tree.created_at)}</span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`/link-trees/${tree.id}`}
                data-testid={`view-link-tree-${tree.id}`}
                on:click|preventDefault={() => navigate(`/link-trees/${tree.id}`)}
                class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Eye size={15} />
                <span>Lihat Detail</span>
              </a>

              {#if tree.user_id === profile.id}
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    data-testid={`edit-link-tree-${tree.id}`}
                    on:click={() => handleEditLinkTree(tree.id)}
                    class="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                    title="Ubah Link Tree"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    data-testid={`delete-link-tree-${tree.id}`}
                    on:click={() => handleDeleteLinkTree(tree.id)}
                    class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus Link Tree"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {:else}
          <div class="py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/80 col-span-full">
            <div class="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Link size={32} />
            </div>
            <p class="text-base font-bold text-slate-700">Tidak ada link tree ditemukan</p>
            <p class="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Coba ganti filter atau mulai dengan menambahkan link tree baru.
            </p>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Add Modal -->
    <AddModal
      show={showAddModal}
      onClose={() => (showAddModal = false)}
      on:close={() => (showAddModal = false)}
    />

    <!-- Edit Modal -->
    <ChangeModal
      show={showChangeModal}
      linkTreeId={selectedLinkTreeId}
      onClose={() => (showChangeModal = false)}
      on:close={() => (showChangeModal = false)}
    />
  </div>
{:else}
  <div class="py-20 flex flex-col items-center justify-center gap-3">
    <LoaderCircle size={32} class="animate-spin text-indigo-600" />
    <h1 class="text-sm font-medium text-slate-600">Memuat daftar link tree...</h1>
  </div>
{/if}

