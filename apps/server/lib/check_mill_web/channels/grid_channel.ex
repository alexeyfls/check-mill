defmodule CheckMillWeb.GridChannel do
  use Phoenix.Channel
  import Bitwise

  alias CheckMill.GridConfig, as: C
  alias CheckMill.GridStore

  @grid_bits C.grid_bits()
  @grid_mask C.grid_mask()

  @seg_bits C.seg_bits()
  @seg_bytes C.seg_bytes()
  @seg_shift C.seg_shift()

  @global_chunk_bytes 16_384

  @flush_ms 15

  @impl true
  def join("grid:main", _payload, socket) do
    socket =
      socket
      |> assign(:cursor, 0)
      |> assign(:segments, MapSet.new())
      |> assign(:pending_patches, [])
      |> assign(:flush_ref, nil)

    send(self(), :push_global_snapshot)
    send(self(), {:set_cursor, 0})

    {:ok, socket}
  end

  @impl true
  def handle_in("cursor", %{"pos" => pos}, socket) when is_integer(pos) do
    pos = pos &&& @grid_mask
    send(self(), {:set_cursor, pos})
    {:noreply, socket}
  end

  @impl true
  def handle_in("toggle", %{"idx" => idx}, socket) when is_integer(idx) do
    idx = idx &&& @grid_mask
    new_val = GridStore.toggle(idx)

    seg_id = idx >>> @seg_shift
    Phoenix.PubSub.broadcast(CheckMill.PubSub, seg_topic(seg_id), {:cell_patch, idx, new_val})

    {:reply, {:ok, %{"idx" => idx, "val" => new_val}}, socket}
  end

  @impl true
  def handle_info({:set_cursor, pos}, socket) do
    wanted = wanted_segments(pos)
    current = socket.assigns.segments

    to_sub = MapSet.difference(wanted, current)
    to_unsub = MapSet.difference(current, wanted)

    Enum.each(to_unsub, fn seg_id ->
      Phoenix.PubSub.unsubscribe(CheckMill.PubSub, seg_topic(seg_id))
    end)

    Enum.each(to_sub, fn seg_id ->
      Phoenix.PubSub.subscribe(CheckMill.PubSub, seg_topic(seg_id))
    end)

    bits = GridStore.window_snapshot(pos)

    if byte_size(bits) != @seg_bytes do
      raise "window snapshot wrong size: expected #{@seg_bytes}, got #{byte_size(bits)}"
    end

    push(socket, "window_snapshot", %{
      "pos" => pos,
      "size" => @seg_bits,
      "bits_b64" => Base.encode64(bits)
    })

    {:noreply, socket |> assign(:cursor, pos) |> assign(:segments, wanted)}
  end

  @impl true
  def handle_info(:push_global_snapshot, socket) do
    chunks = GridStore.global_snapshot_chunks(@global_chunk_bytes)
    total = length(chunks)

    push(socket, "global_snapshot_begin", %{
      "total_bits" => @grid_bits,
      "chunk_bytes" => @global_chunk_bytes,
      "chunks" => total
    })

    chunks
    |> Enum.with_index()
    |> Enum.each(fn {chunk, i} ->
      push(socket, "global_snapshot_chunk", %{
        "i" => i,
        "b64" => Base.encode64(chunk)
      })
    end)

    push(socket, "global_snapshot_done", %{})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:cell_patch, idx, val}, socket) do
    {:noreply, queue_patch(socket, idx, val)}
  end

  @impl true
  def handle_info(:flush_patches, socket) do
    patches = Enum.reverse(socket.assigns.pending_patches)

    socket =
      socket
      |> assign(:pending_patches, [])
      |> assign(:flush_ref, nil)

    if patches != [] do
      push(socket, "patch_batch", %{"patches" => patches})
    end

    {:noreply, socket}
  end

  defp queue_patch(socket, idx, val) do
    socket =
      update_in(socket.assigns.pending_patches, fn list ->
        [[idx, val] | list]
      end)

    case socket.assigns.flush_ref do
      nil ->
        ref = Process.send_after(self(), :flush_patches, @flush_ms)
        assign(socket, :flush_ref, ref)

      _ ->
        socket
    end
  end

  defp wanted_segments(pos) do
    start_seg = pos >>> @seg_shift
    end_pos = pos + (@seg_bits - 1) &&& @grid_mask
    end_seg = end_pos >>> @seg_shift

    if start_seg == end_seg do
      MapSet.new([start_seg])
    else
      MapSet.new([start_seg, end_seg])
    end
  end

  defp seg_topic(seg_id), do: "grid:seg:#{seg_id}"
end
