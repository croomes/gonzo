class Release < ActiveRecord::Base
  belongs_to :product
  has_many :hosts
  
  extend FriendlyId
  friendly_id :version, use: :slugged
  
  # Use default slug, but upper case and with underscores
  def normalize_friendly_id(string)
    super.gsub("-", ".")
  end  
end
