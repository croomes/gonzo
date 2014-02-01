require 'mcollective/couchdb'

module Mcollective
  class Ping
    @queue = :mcollective_jobs
    def self.perform()
      include MCollective::Couchdb

      Resque.logger.info("Starting Ping")

      @db = connect("localhost", "5984", "ping")

      mc = rpcclient("ping", {:color => "false"})
      mc.ping().each do |resp|
        save(resp[:sender], resp.results)
      end
      mc.disconnect
    end
  end
end