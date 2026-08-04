-- ─────────────────────────────────────────────────────────────
-- pgvector-backed lesson retrieval for the interactive AI tutor.
--
-- Goal: instead of stuffing a whole lesson (~3,000 tokens) into every
-- Haiku prompt, embed the pre-generated lesson library once, then retrieve
-- only the 2-3 most relevant chunks per student question (~300 tokens).
-- ─────────────────────────────────────────────────────────────

create extension if not exists vector;

-- text-embedding-004 produces 768-dimensional vectors.
create table if not exists public.lesson_chunks (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   text,
  module      text,
  topic       text,
  content     text not null,
  embedding   vector(768),
  created_at  timestamptz not null default now()
);

-- Approximate-nearest-neighbour index (cosine distance).
create index if not exists lesson_chunks_embedding_idx
  on public.lesson_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists lesson_chunks_module_idx
  on public.lesson_chunks (module);

-- Avoid duplicate chunks when the same lesson is re-ingested.
create unique index if not exists lesson_chunks_lesson_content_uidx
  on public.lesson_chunks (lesson_id, md5(content));

-- Semantic similarity search. Returns the closest chunks, optionally
-- scoped to a module, with a cosine-similarity score in [0, 1].
create or replace function public.match_lesson_chunks(
  query_embedding vector(768),
  match_count int default 3,
  filter_module text default null
)
returns table (
  id uuid,
  lesson_id text,
  module text,
  topic text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    lc.id,
    lc.lesson_id,
    lc.module,
    lc.topic,
    lc.content,
    1 - (lc.embedding <=> query_embedding) as similarity
  from public.lesson_chunks lc
  where lc.embedding is not null
    and (filter_module is null or lc.module = filter_module)
  order by lc.embedding <=> query_embedding
  limit match_count;
$$;

-- Row Level Security: lesson content is shared learning material.
alter table public.lesson_chunks enable row level security;

drop policy if exists "lesson_chunks readable by authenticated" on public.lesson_chunks;
create policy "lesson_chunks readable by authenticated"
  on public.lesson_chunks for select
  to authenticated
  using (true);

-- Writes (ingestion) go through the service role / edge functions only.
drop policy if exists "lesson_chunks writable by service role" on public.lesson_chunks;
create policy "lesson_chunks writable by service role"
  on public.lesson_chunks for all
  to service_role
  using (true)
  with check (true);
