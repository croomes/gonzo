class Node < CouchRest::Model::Base
  use_database 'mcollective'
  property :key, String  
  property :identity, String  
  property :agentlist, [String]
  property :facts, [String]  
  property :classes, [String]    
  property :collectives, [String]    
  property :lastseen, String  
  
  design do
    view :agentlist,
      :map =>
        "function(doc) { 
          if (doc.key && doc.agentlist) {
            doc.agentlist.forEach(function(agent) { 
              emit(agent, 1); 
            });
          }
        }",      
      :reduce =>
        "function(keys, values) { 
          return sum(values); 
        }"    
  end
  
  def self.agents
    Node.agentlist.reduce.group_level(1).keys
  end
end