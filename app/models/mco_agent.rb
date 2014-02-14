class McoAgent < ActiveRecord::Base
  
  self.table_name = "agents"
  
  extend FriendlyId
  friendly_id :name, use: :slugged

end
