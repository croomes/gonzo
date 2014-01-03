json.array!(@hosts) do |host|
  json.extract! host, :id
  json.url host_url(host, format: :json)
end
