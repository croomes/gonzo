class Api::V1::ReleasesController < ApplicationController

  before_action :set_release, only: [:show, :edit, :update, :check, :destroy]

  # GET /releases
  # GET /releases.json
  def index
    render json: Release.includes(:product).load.as_json(:include => :product)
  end

  def show
    render json: @release.as_json(:include => :product)
  end

  # PUT /releases/1/check
  def check
    Resque.enqueue(Mcollective::CheckRelease, @release.id)
    render json: {}
  end  

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_release
      @release = Release.includes(:product).find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def release_params
      params.require(:release).permit(:version, :product_id, :status)
    end

end