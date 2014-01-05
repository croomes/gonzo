class HostRelease < ActiveRecord::Base
  belongs_to :host
  belongs_to :release
  
  self.primary_key = [:host_id, :release_id]

end
