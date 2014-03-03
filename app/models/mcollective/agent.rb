class Mcollective::Agent
  require 'gonzo/couchdb'
  include Comparable

  # TODO: Not working after move to gonzo/couchdb - use couchrest instead?
  def self.all
    @db.connect({"db" => "mcollective"})
    @db.view('_design/agentlist')['rows'].inspect
  end

end