defmodule CheckMill.SegmentBroadcaster do
  use GenServer

  alias CheckMill.GridConfig

  @max_unique_per_segment GridConfig.max_unique_per_segment()
  @broadcast_flush_ms GridConfig.broadcast_flush_ms()

  defmodule Segment do
    defstruct timer_ref: nil, buf: %{}, overflow?: false, seq: 0

    @type t :: %__MODULE__{
            timer_ref: reference() | nil,
            buf: map(),
            overflow?: boolean(),
            seq: integer()
          }
  end

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def enqueue(seg_id, idx, val) do
    GenServer.cast(__MODULE__, {:enqueue, seg_id, idx, val})
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_cast({:enqueue, seg_id, idx, val}, segments) do
    new_segments =
      Map.update(
        segments,
        seg_id,
        start_segment(seg_id) |> put_patch(idx, val),
        fn seg -> seg |> put_patch(idx, val) |> ensure_timer(seg_id) end
      )

    {:noreply, new_segments}
  end

  @impl true
  def handle_info({:flush, seg_id}, segments) do
    case Map.pop(segments, seg_id) do
      {nil, segments} ->
        {:noreply, segments}

      {%Segment{} = seg, rest_segments} ->
        broadcast_updates(seg_id, seg)
        updated_seg = %Segment{seq: seg.seq + 1}
        {:noreply, Map.put(rest_segments, seg_id, updated_seg)}
    end
  end

  defp start_segment(seg_id) do
    %Segment{
      timer_ref: Process.send_after(self(), {:flush, seg_id}, @broadcast_flush_ms)
    }
  end

  defp put_patch(%Segment{buf: buf} = seg, idx, val) when is_map_key(buf, idx) do
    %{seg | buf: Map.put(buf, idx, val)}
  end

  defp put_patch(%Segment{buf: buf} = seg, idx, val)
       when map_size(buf) < @max_unique_per_segment do
    %{seg | buf: Map.put(buf, idx, val)}
  end

  defp put_patch(%Segment{} = seg, _idx, _val) do
    %{seg | overflow?: true}
  end

  defp ensure_timer(%Segment{timer_ref: nil} = seg, seg_id), do: start_segment(seg_id)
  defp ensure_timer(seg, _seg_id), do: seg

  defp broadcast_updates(seg_id, %Segment{buf: buf, overflow?: ovf, seq: seq}) do
    topic = "grid:seg:#{seg_id}"

    if map_size(buf) > 0 do
      patches = Enum.map(buf, fn {idx, val} -> [idx, val] end)
      Phoenix.PubSub.broadcast(CheckMill.PubSub, topic, {:patch_batch, seq, patches})
    end

    if ovf do
      Phoenix.PubSub.broadcast(CheckMill.PubSub, topic, {:seg_overflow, seq})
    end
  end
end
