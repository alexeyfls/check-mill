defmodule CheckMill.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {DNSCluster, query: Application.get_env(:check_mill, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: CheckMill.PubSub},
      {CheckMill.RateLimit, [clean_period: :timer.minutes(1)]},
      CheckMill.GridStore,
      CheckMill.SegmentBroadcaster,
      CheckMillWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: CheckMill.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    CheckMillWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
