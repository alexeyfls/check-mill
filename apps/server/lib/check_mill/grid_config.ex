defmodule CheckMill.GridConfig do
  # ---- 1. Grid Dimensions (Power of 2 optimized) ----
  @grid_bits 1_048_576
  @grid_mask @grid_bits - 1

  # ---- 2. Segment / Viewport ----
  @seg_bits 2_048
  @seg_bytes div(@seg_bits, 8)
  @seg_shift 11

  # ---- 3. Storage Chunking (ETS Optimization) ----
  @chunk_bits 8_192
  @chunk_bytes div(@chunk_bits, 8)
  @chunk_shift 13

  # ---- 4. Broadcaster Tuning (Egress) ----
  @broadcast_flush_ms 64
  @max_unique_per_segment 4_096

  # ---- 5. Hammer Rate Limiting (Ingress) ----
  @join_limit_count 5
  @join_limit_ms 60_000
  @toggle_limit_count 30
  @toggle_limit_ms 2_000

  # ---- 6. Network / Protocol Tuning ----
  @max_toggles_per_msg 2_048
  @global_chunk_bytes 16_384

  # ---- Accessors ----
  def grid_bits, do: @grid_bits
  def grid_mask, do: @grid_mask

  def seg_bits, do: @seg_bits
  def seg_bytes, do: @seg_bytes
  def seg_shift, do: @seg_shift

  def chunk_bits, do: @chunk_bits
  def chunk_bytes, do: @chunk_bytes
  def chunk_shift, do: @chunk_shift

  def num_segments, do: div(@grid_bits, @seg_bits)
  def num_chunks, do: div(@grid_bits, @chunk_bits)

  def broadcast_flush_ms, do: @broadcast_flush_ms
  def max_unique_per_segment, do: @max_unique_per_segment

  def join_limit_count, do: @join_limit_count
  def join_limit_ms, do: @join_limit_ms
  def toggle_limit_count, do: @toggle_limit_count
  def toggle_limit_ms, do: @toggle_limit_ms

  def max_toggles_per_msg, do: @max_toggles_per_msg
  def global_chunk_bytes, do: @global_chunk_bytes
end
