defmodule CheckMillWeb.RoomChannel do
  use Phoenix.Channel

  alias CheckMill.Compare

  # Message modes
  @single_change_flag 0
  @multi_change_flag 1

  # Bit/Byte sizes for the fields
  @index_bits 10
  @offset_bits 10
  @chunk_index_bits 16
  @bitmap_bits 16

  @single_change_size 3
  @multi_change_size 4

  @impl true
  def join("room:" <> offset_str, _payload, socket) do
    _offset = String.to_integer(offset_str) |> Compare.clamp(0, 100)

    # Get snapshot of topic and send it to the user

    {:ok, socket}
  end

  @impl true
  def handle_in("update", {:binary, chunk}, socket) do
    # TODO:
    # - store updates to persistent store,
    # - update local state for specific topic,
    # - notify subscribers
    #

    case chunk do
      <<@single_change_flag::1, index::@index_bits, offset::@offset_bits, _padding::3>> ->
        nil

      <<@multi_change_flag::1, chunk_size::@chunk_index_bits-1, bitmap::@bitmap_bits,
        _padding::0>> ->
        nil
    end

    {:reply, {:ok, byte_size(chunk)}, socket}
  end
end
