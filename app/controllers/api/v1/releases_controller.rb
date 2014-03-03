class Api::V1::ReleasesController < ApplicationController

  before_action :set_release, only: [:show, :edit, :update, :check, :destroy]

  # GET /releases
  # GET /releases.json
  def index
    render json: Release.all
  end

  def show
    render json: @release
  end

  def refresh
    Resque.enqueue(AddReleases)
    render json: {}
  end

  # PUT /releases/1/check
  def check
    Resque.enqueue(Mcollective::CheckRelease, @release.slug)
    render json: {}
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_release
      @release = Release.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def release_params
      params.require(:release).permit(:slug, :status)
    end

end