class Product < ActiveRecord::Base
  has_many :releases
  has_many :hosts, through: :releases
    
  extend FriendlyId
  friendly_id :name, use: :slugged

end
