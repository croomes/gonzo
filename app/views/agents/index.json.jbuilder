json.array!(@agents) do |agent|
  json.name agent
  json.url agent_url(agent, format: :json)
end
