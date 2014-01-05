class Host < ActiveRecord::Base
  has_many :host_releases
  has_many :releases, through: :host_releases
  has_many :products, through: :releases
  
  extend FriendlyId
  friendly_id :name, use: :slugged
  
  # Use default slug, but upper case and with underscores
  def normalize_friendly_id(string)
    super.gsub("-", ".")
  end
end
