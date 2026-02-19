defmodule CheckMill.SegmentBroadcaster do
  use GenServer

  @flush_ms 64

  def start_link(_opts), do: GenServer.start_link(__MODULE__, %{}, name: __MODULE__)

  def enqueue(seg_id, idx, val) do
    GenServer.cast(__MODULE__, {:enqueue, seg_id, idx, val})
  end

  @impl true
  def init(state), do: {:ok, Map.put(state, :timers, %{})}

  @impl true
  def handle_cast({:enqueue, seg_id, idx, val}, state) do
    buckets = Map.get(state, :buckets, %{})
    timers = state.timers

    buckets =
      Map.update(buckets, seg_id, [[idx, val]], fn list ->
        [[idx, val] | list]
      end)

    timers =
      case Map.get(timers, seg_id) do
        nil ->
          ref = Process.send_after(self(), {:flush, seg_id}, @flush_ms)
          Map.put(timers, seg_id, ref)

        _ ->
          timers
      end

    {:noreply, %{state | buckets: buckets, timers: timers}}
  end

  @impl true
  def handle_info({:flush, seg_id}, state) do
    buckets = Map.get(state, :buckets, %{})
    timers = Map.delete(state.timers, seg_id)

    patches =
      buckets
      |> Map.get(seg_id, [])
      |> Enum.reduce(%{}, fn [idx, val], acc -> Map.put(acc, idx, val) end)
      |> Enum.map(fn {idx, val} -> [idx, val] end)

    buckets = Map.delete(buckets, seg_id)

    if patches != [] do
      Phoenix.PubSub.broadcast(CheckMill.PubSub, "grid:seg:#{seg_id}", {:patch_batch, patches})
    end

    {:noreply, %{state | buckets: buckets, timers: timers}}
  end
end
