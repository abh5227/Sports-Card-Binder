<script lang="ts">
/* Stage B placeholder. It exists to prove one thing: the toolchain is connected
     end to end. Svelte 5 runes compile, Vite builds, the Node server serves the
     build, and the SQLite connection in $BINDER_DATA_DIR actually opens.

     There is no binder here yet, and deliberately so. */

type Health = {
	ok: boolean;
	node: string;
	sqlite: string;
	dataDir: string;
	databaseFile: string;
};

let health = $state<Health | null>(null);
let error = $state<string | null>(null);

$effect(() => {
	fetch("/api/health")
		.then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
		.then((data: Health) => {
			health = data;
		})
		.catch((e: Error) => {
			error = e.message;
		});
});
</script>

<main>
  <h1>Sports Card Binder</h1>
  <p class="stage">Stage B — scaffold. No schema, no binder, no cards yet.</p>

  {#if error}
    <p class="bad" data-testid="health-error">API unreachable: {error}</p>
  {:else if health}
    <dl data-testid="health">
      <dt>node</dt>
      <dd>{health.node}</dd>
      <dt>sqlite</dt>
      <dd>{health.sqlite}</dd>
      <dt>data directory</dt>
      <dd>{health.dataDir}</dd>
    </dl>
    <p class="ok" data-testid="health-ok">Toolchain connected end to end.</p>
  {:else}
    <p class="dim">Checking…</p>
  {/if}
</main>

<style>
  main {
    max-width: 34rem;
    padding: 2.5rem;
    text-align: left;
  }

  h1 {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .stage {
    margin: 0 0 2rem;
    color: var(--ink-dim);
    font-size: 0.875rem;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.4rem 1.25rem;
    margin: 0 0 1.5rem;
    padding: 1rem 1.25rem;
    background: var(--page);
    border-radius: 3px;
    font-size: 0.8125rem;
  }

  dt {
    color: var(--ink-dim);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.6875rem;
    align-self: center;
  }

  dd {
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, monospace;
    word-break: break-all;
  }

  .ok {
    margin: 0;
    color: var(--ledger);
    font-size: 0.8125rem;
  }

  .bad {
    color: #c46a5a;
    font-size: 0.875rem;
  }

  .dim {
    color: var(--ink-dim);
    font-size: 0.875rem;
  }
</style>
