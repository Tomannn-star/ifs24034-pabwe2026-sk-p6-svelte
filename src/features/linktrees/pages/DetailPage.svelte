<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    ArrowLeft,
    ImagePlus,
    PenLine,
    Trash2,
    Calendar,
    Globe,
    Lock,
    Eye,
    Link as LinkIcon,
    Plus,
    ExternalLink,
    User,
  } from "lucide-svelte";

  export let linkTreeId;

  $: profile = $usersStore.profile;
  $: linkTree = $linkTreesStore.linkTree;
  $: isOwner = Boolean(profile && linkTree && linkTree.user_id === profile.id);

  let showCoverModal = false;
  let showEditModal = false;
  let showItemModal = false;
  let selectedItem = null;

  let MarkdownViewer = null;

  onMount(() => {
    if (linkTreeId) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
    }
    import("../components/MarkdownViewer.svelte").then((m) => {
      MarkdownViewer = m.default;
    });
  });

  let prevId = linkTreeId;
  $: if (linkTreeId !== prevId) {
    prevId = linkTreeId;
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  $: if ($linkTreesStore.isLinkTree) {
    linkTreesStore.setIsLinkTree(false);
    if (!linkTree) {
      navigate("/");
    }
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    navigate("/");
  }

  async function handleDeleteLinkTree() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus link tree ini?"
    );
    if (result.isConfirmed && linkTree) {
      linkTreesStore.asyncSetIsLinkTreeDelete(linkTree.id);
    }
  }

  function openAddItemModal() {
    selectedItem = null;
    showItemModal = true;
  }

  function openEditItemModal(item) {
    selectedItem = item;
    showItemModal = true;
  }

  async function handleDeleteItem(item) {
    const result = await showConfirmDialog(
      `Apakah Anda yakin ingin menghapus tautan "${item.title}"?`
    );
    if (result.isConfirmed && linkTree) {
      linkTreesStore.asyncSetIsLinkTreeDeleteItem(linkTree.id, item.id);
    }
  }
</script>

{#if !profile || !linkTree}
  <div class="flex flex-col items-center justify-center py-20" data-testid="loading-spinner">
    <div
      class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
    ></div>
    <h1 class="text-sm font-medium text-slate-600 mt-3">Memuat detail link tree...</h1>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
    <!-- Navigation & Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <a
        href="/"
        data-testid="back-to-linktrees-link"
        on:click|preventDefault={() => navigate("/")}
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Link Tree
      </a>

      {#if isOwner}
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="edit-cover-btn"
            on:click={() => (showCoverModal = true)}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
          >
            <ImagePlus size={16} />
            Ubah Cover
          </button>
          <button
            type="button"
            data-testid="edit-detail-linktree-btn"
            on:click={() => (showEditModal = true)}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
          >
            <PenLine size={16} />
            Ubah Data
          </button>
          <button
            type="button"
            data-testid="delete-detail-linktree-btn"
            on:click={handleDeleteLinkTree}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      {/if}
    </div>

    <!-- Main Detail Card -->
    <div
      class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      {#if linkTree.cover}
        <div class="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img
            src={linkTree.cover && linkTree.cover.includes("delcom.org")
              ? `/_vercel/image?url=${encodeURIComponent("https://open-api.delcom.org" + linkTree.cover.replace("https://open-api.delcom.org", ""))}&w=640&q=75`
              : linkTree.cover}
            alt={linkTree.title}
            width="640"
            height="256"
            class="w-full h-full object-cover"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"
          ></div>
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-6">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs font-bold text-slate-600">
              {"#" + linkTree.id}
            </span>
            {#if linkTree.type === "public"}
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <Globe size={14} />
                Publik
              </span>
            {:else if linkTree.type === "unlisted"}
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200"
              >
                <Eye size={14} />
                Unlisted
              </span>
            {:else}
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
              >
                <Lock size={14} />
                Privat
              </span>
            {/if}
          </div>

          <h1
            class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            {linkTree.title}
          </h1>

          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600"
          >
            {#if linkTree.user?.name || linkTree.author}
              <div class="flex items-center gap-1.5">
                <User size={14} class="shrink-0" />
                <span
                  >Pemilik: <strong class="text-slate-700"
                    >{linkTree.user?.name || linkTree.author}</strong
                  ></span
                >
              </div>
            {/if}
            <div class="flex items-center gap-1.5">
              <Calendar size={14} class="shrink-0" />
              <span
                >Dibuat: <strong class="text-slate-500"
                  >{formatDate(linkTree.created_at)}</strong
                ></span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar size={14} class="shrink-0" />
              <span
                >Diperbarui: <strong class="text-slate-500"
                  >{formatDate(linkTree.updated_at)}</strong
                ></span
              >
            </div>
          </div>
        </div>

        <div
          data-testid="linktree-detail-description"
          class="prose max-w-none text-slate-600 bg-slate-50/60 p-6 rounded-2xl border border-slate-100 leading-relaxed"
        >
          {#if linkTree.description}
            {#if MarkdownViewer}
              <svelte:component this={MarkdownViewer} content={linkTree.description} />
            {:else}
              <div data-testid="markdown-viewer" class="text-sm text-slate-700 whitespace-pre-line">{linkTree.description}</div>
            {/if}
          {:else}
            <p class="italic text-slate-600">
              Tidak ada deskripsi rinci untuk link tree ini.
            </p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Links Section -->
    <div
      class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"
          >
            <LinkIcon size={18} />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Daftar Item Tautan</h2>
            <p class="text-xs text-slate-600">
              {linkTree.items && linkTree.items.length > 0
                ? `${linkTree.items.length} tautan tersedia`
                : "Belum ada item tautan"}
            </p>
          </div>
        </div>

        {#if isOwner}
          <button
            type="button"
            data-testid="add-item-btn"
            on:click={openAddItemModal}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-colors"
          >
            <Plus size={16} />
            Tambah Tautan
          </button>
        {/if}
      </div>

      <div class="grid grid-cols-1 gap-3">
        {#each linkTree.items as item}
          <div
            data-testid={`link-tree-item-${item.id}`}
            class="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-xs transition-all"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`item-external-link-${item.id}`}
              class="flex items-center gap-3 min-w-0 flex-1 hover:text-indigo-600 transition-colors"
            >
              <div
                class="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-500 group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors"
              >
                <LinkIcon size={18} />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-sm text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </div>
                <div class="text-xs text-slate-600 truncate flex items-center gap-1">
                  <span class="truncate">{item.url}</span>
                  <ExternalLink size={12} class="shrink-0 opacity-70" />
                </div>
              </div>
            </a>

            {#if isOwner}
              <div class="flex items-center gap-1.5 ml-3 shrink-0">
                <button
                  type="button"
                  data-testid={`edit-item-btn-${item.id}`}
                  on:click={() => openEditItemModal(item)}
                  class="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Ubah Item"
                >
                  <PenLine size={16} />
                </button>
                <button
                  type="button"
                  data-testid={`delete-item-btn-${item.id}`}
                  on:click={() => handleDeleteItem(item)}
                  class="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <div
            data-testid="empty-items-state"
            class="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50"
          >
            <p class="text-sm font-medium text-slate-500">
              Belum ada item tautan yang ditambahkan.
            </p>
            {#if isOwner}
              <button
                type="button"
                data-testid="add-first-item-btn"
                on:click={openAddItemModal}
                class="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={14} />
                Tambah Tautan Pertama
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Modals -->
    <ChangeCoverModal
      show={showCoverModal}
      {linkTree}
      onClose={() => (showCoverModal = false)}
      on:close={() => (showCoverModal = false)}
    />

    <ChangeModal
      show={showEditModal}
      linkTreeId={linkTree.id}
      onClose={() => (showEditModal = false)}
      on:close={() => (showEditModal = false)}
    />

    <ItemModal
      show={showItemModal}
      linkTreeId={linkTree.id}
      item={selectedItem}
      onClose={() => (showItemModal = false)}
      on:close={() => (showItemModal = false)}
    />
  </div>
{/if}

