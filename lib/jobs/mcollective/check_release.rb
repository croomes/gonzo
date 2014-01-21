require 'mcollective/couchdb'

module Mcollective
  class CheckRelease
    @queue = :mcollective_jobs
    def self.perform(release_id)
      include MCollective::Couchdb

      Resque.logger.info("Starting CheckRelease")

      # Database names can't contain dots or begin with a digit :(
      release = Release.find(release_id)
      dbname = "v" + release.version.gsub!(".", "_")
      @db = connect("localhost", "5984", dbname)

      mc = rpcclient("puppetenforce", {:color => "false"})
      mc.check().each do |resp|
        save(resp[:sender], resp.results)
      end
      mc.disconnect
    end
  end
end