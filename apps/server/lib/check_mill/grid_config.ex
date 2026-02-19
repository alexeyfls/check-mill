defmodule CheckMill.GridConfig do
  @grid_bits 1_048_576
  @grid_mask @grid_bits - 1

  @seg_bits 2_048
  @seg_bytes div(@seg_bits, 8)
  @seg_shift 11

  @chunk_bits 8_192
  @chunk_bytes div(@chunk_bits, 8)
  @chunk_shift 13

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
end
