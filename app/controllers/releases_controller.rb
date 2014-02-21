class ReleasesController < ApplicationController
  before_action :set_release, only: [:show, :edit, :update, :check, :destroy]

  # GET /releases
  # GET /releases.json
  def index
    @releases = Release.all
    respond_to do |format|
      format.html { render html: @releases }
      format.json { render json: @releases }
    end    
  end

  # GET /releases/1
  # GET /releases/1.json
  def show
  end

  # GET /releases/new
  def new
    @release = Release.new
  end

  # GET /releases/1/edit
  def edit
  end

  # POST /releases
  # POST /releases.json
  def create
    @release = Release.new(release_params)

    respond_to do |format|
      if @release.save
        format.html { redirect_to @release, notice: 'Release was successfully created.' }
        format.json { render action: 'show', status: :created, location: @release }
      else
        format.html { render action: 'new' }
        format.json { render json: @release.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /releases/1
  # PATCH/PUT /releases/1.json
  def update
    respond_to do |format|
      if @release.update(release_params)
        format.html { redirect_to @release, notice: 'Release was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @release.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /releases/1
  # DELETE /releases/1.json
  def destroy
    @release.destroy
    respond_to do |format|
      format.html { redirect_to releases_url }
      format.json { head :no_content }
    end
  end
  
  # PUT /releases/1/check
  def check
    Resque.enqueue(Mcollective::CheckRelease, @release.id)
    respond_to do |format|
      format.html { redirect_to summary_release_path, :notice => "Job submitted." }
      format.json { head :no_content }
    end
  end

  # GET /releases/1/summary
  def summary  
  end
  
  private
    # Use callbacks to share common setup or constraints between actions.
    def set_release
      @release = Release.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def release_params
      params.require(:release).permit(:version, :product_id, :status)
    end
end
