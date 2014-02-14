class Mcollective::Agent
  require 'MCollective/Couchdb'
  include Comparable
  
  def self.all
    @db.view('_design/agentlist')['rows'].inspect 
    # agents = $redis.keys("mcollective::collective::*")
    # for ckey in collectives
    #   yield ckey.gsub(/^mcollective\:\:collective\:\:/, ""), ckey
    # end    
  end  
  
end