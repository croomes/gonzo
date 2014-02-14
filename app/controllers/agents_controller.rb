class AgentsController < ApplicationController
  
  # GET /agents
  # GET /agents.json
  # GET /api/agents
  def index
    @agents = Node.agents
  end

end
