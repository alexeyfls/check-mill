defmodule CheckMill.RateLimit do
  use Hammer, backend: :ets
end
