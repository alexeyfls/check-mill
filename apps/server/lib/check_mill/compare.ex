defmodule CheckMill.Compare do
  @moduledoc """
  Utility comparison helpers, e.g. for clamping numeric values within a range.
  """

  @doc """
  Clamps `value` so that it stays within the inclusive range `[min, max]`.
  """
  @spec clamp(number(), number(), number()) :: number()
  def clamp(value, minimum, maximum)
      when is_number(value) and is_number(minimum) and is_number(maximum) do
    value
    |> max(minimum)
    |> min(maximum)
  end
end
