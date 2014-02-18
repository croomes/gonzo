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

      begin
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
      rescue
        Resque.logger.info("CouchDB changelist already created")
      end

      mc = rpcclient("puppetenforce", {:color => "false"})
      mc.check(:environment => "uat") do |resp|
        begin
          resp[:collection] = "report"
          resp[:changes] = []
          resp[:body][:data][:output].each_line do |line|

            # New change block starting with xxxx:
            if line.match(/^[A-Z][a-z]*:/)

              # Previous block needs to be saved
              unless @changeref.nil?

                # If we've saved this change before, replace the current block with
                # it as it contains node data
                begin
                  change = MCollective::Cache.read(:release_results, @changeref)
                  Resque.logger.debug("#{resp[:senderid]}: Found in cache: #{@changeref}")
                  change[:nodes] << resp[:senderid]
                rescue
                  change = Hash[:collection => 'change', :output => @block, :nodes => [resp[:senderid]]]
                  Resque.logger.debug("#{resp[:senderid]}: NOT Found in cache: #{@changeref}")
                end

                # Add our node to the change, then write to couch and cache
                begin
                  MCollective::Cache.write(:release_results, @changeref, change)
                  save(@changeref, change)
                rescue
                  Resque.logger.info("#{resp[:senderid]}: Error writing: #{@changeref}")
                end
                resp[:changes] << @changeref
                @changeref = nil
                @block = nil
              end

              case line
                when /^Info:/,
                     /^Notice: Finished catalog run/,
                     /^Notice: .*\/File\[.*\]\/content: current_value \{md5\}[a-z0-9]*, should be \{md5\}[a-z0-9]*  \(noop\)$/
                  @skip = true
                else
                  @skip = false
                  @changeref = Digest::MD5.hexdigest(line.strip)
                  Resque.logger.debug("#{@changeref}: #{line.strip}")
              end
            end
            unless @skip
              (@block ||= "") << line
            end
          end

          # Save the report
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