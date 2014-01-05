json.array!(@releases) do |release|
  json.extract! release, :id
  json.url release_url(release, format: :json)
end
