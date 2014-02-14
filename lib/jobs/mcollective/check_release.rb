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
      mc.check(:environment => "uat") do |resp|
        begin
          resp[:changes] = []
          block = ""
          resp[:body][:data][:output].each_line do |line|
            if line.match(/^[A-Z][a-z]*:/) && ! block.empty?
              resp[:changes] << block
              block = ""
            end
            unless line.match(/^Info:/)
              block << line
            end
          end

          # Debug
          puts resp[:changes]

          save(resp[:senderid], resp)
        rescue RPCError => e
          puts "The RPC agent returned an error: #{e}"
        end
      end
      mc.disconnect
    end
  end
end