class NodesController < ApplicationController
  # before_action :set_node, only: [:show]

  # GET /nodes
  # GET /nodes.json
  def index
    @nodes = Node.all
  end

  # GET /nodes/1
  # GET /nodes/1.json
  def show
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    # def set_node
    #   @node = Node.find(params[:id])
    # end
end
