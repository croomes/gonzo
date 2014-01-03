class Host < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  
  # Use default slug, but upper case and with underscores
  def normalize_friendly_id(string)
    super.gsub("-", ".")
  end
end
