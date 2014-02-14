require 'mcollective/couchdb'
require 'mcollective/cache'
require 'digest/md5'

module Mcollective
  class CheckRelease
    @queue = :mcollective_jobs
    Resque.logger.level = Logger::DEBUG
    def self.perform(release_id)
      include MCollective::Couchdb

      Resque.logger.info("Starting CheckRelease")

      # Setup cache
      MCollective::Cache.setup(:release_results, 600)

      # Database names can't contain dots or begin with a digit :(
      release = Release.find(release_id)
      dbname = "v" + release.version.gsub!(".", "_")
      @db = connect("localhost", "5984", dbname)

      @db.save_doc({
        "_id" => "_design/changelist",
        :views => {
         :all => {
           :map => changelist_map,
           :reduce => changelist_reduce,
         },
        }
      })
      Resque.logger.info("CouchDB changelist view created")

      mc = rpcclient("puppetenforce", {:color => "false"})
      mc.check(:environment => "uat") do |resp|
        begin
          resp[:collection] = "report"
          resp[:changes] = []
          block = ""
          resp[:body][:data][:output].each_line do |line|

            if line.match(/^[A-Z][a-z]*:/)
              # New block starting with xxxx:
              hash = Digest::MD5.hexdigest(line)
              resp[:hash] = hash

              # Previous block needs to be saved
              if ! block.empty?
                begin
                  cached_block = MCollective::Cache.read(:release_results, hash)
                  Resque.logger.debug("#{resp[:senderid]}: Found in cache: #{hash}")
                rescue
                  cached_block = MCollective::Cache.write(:release_results, hash, block)
                  save(hash, Hash[:collection => 'change', :output => cached_block])
                  Resque.logger.debug("#{resp[:senderid]}: Saved in CouchDB and cached: #{hash}")
                end
                resp[:changes] << hash # block
                block = ""
              end
            end
            unless line.match(/^Info:/)
              # Add line to block, skipping single-line Info
              # TODO: breaks on multi-line Info
              block << line
            end
          end

          # Debug
          # puts resp[:changes]

          save(resp[:senderid], resp)

        rescue RPCError => e
          puts "The RPC agent returned an error: #{e}"
        end
      end
      mc.disconnect
    end

    def self.changelist_map
      <<-EOM.gsub(/^ {8}/, "")
        function(doc) {
          if ("changes" == doc.collection) {
            emit([doc._id, 0]);
          }
          if ("report") {
            if (doc.changes) {
              for (var i in doc.changes) {
                emit([doc.changes[i], 1], doc._id);
              }
            }
          }
        }
        EOM
    end

    def self.changelist_reduce
      <<-EOR.gsub(/^ {8}/, "")
        function(keys, values) {
          return sum(values);
        }
        EOR
    end
  end
end