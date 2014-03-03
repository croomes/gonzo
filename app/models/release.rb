class Release < CouchRest::Model::Base

  use_database 'releases'
  unique_id do |model|
    model.slug
  end

  property :slug
  property :status, :default => 'Available'
  timestamps!
  design

end