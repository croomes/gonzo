require 'gonzo/couchdb'
require 'mcollective/cache'
require 'digest/md5'

module Mcollective
  class CheckRelease
    @queue = :mcollective_jobs
    Resque.logger.level = Logger::DEBUG
    def self.perform(release)
      include Gonzo::Couchdb

      Resque.logger.info("Starting CheckRelease for release #{release}")

      # Setup cache
      MCollective::Cache.setup(:release_results, 600)

      # TODO: Database names can't contain dots or begin with a digit :(
      @db = connect({"db" => "#{release}"})
      @views = ["changelist", "risk", "hostrisk"]

      # Create helper views
      @views.each do |view|
        create_view(view)
      end

      mc = rpcclient("gonzo", {:color => "false"})
      mc.check(:environment => release) do |resp|
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
                     /^Notice: .*\/File\[.*\]\/content: current_value \{md5\}[a-f0-9]*, should be/
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

    def self.create_view(view)
      begin
        @db.save_doc({
          "_id" => "_design/#{view}",
          :views => {
            :all => {
              :map => self.send("#{view}_map"),
              :reduce => self.send("#{view}_reduce"),
            },
          }
        })
        Resque.logger.info("CouchDB #{view} view created")
      rescue
        Resque.logger.info("CouchDB #{view} view already created")
      end
    end

    def self.changelist_map
      <<-EOCM.gsub(/^ {8}/, "")
        function(doc) {
          if ("change" == doc.collection) {
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
        EOCM
    end

    def self.changelist_reduce
      <<-EOCR.gsub(/^ {8}/, "")
        function(keys, values) {
          return sum(values);
        }
        EOCR
    end

    def self.risk_map
      <<-EORM.gsub(/^ {8}/, "")
        function(doc) {
          if ("change" == doc.collection) {
            if (doc.risk) {
              emit(doc.risk, 1);
            }
            else {
              emit("unassessed", 1);
            }
          }
        }
        EORM
    end

    def self.risk_reduce
      <<-EORR.gsub(/^ {8}/, "")
        function(keys, values) {
          return sum(values);
        }
        EORR
    end

    def self.hostrisk_map
      <<-EORM.gsub(/^ {8}/, "")
        function(doc) {
          if ("change" == doc.collection) {
            if (doc.risk) {
              emit(doc.risk, doc.nodes);
            }
            else {
              emit("unassessed", doc.nodes);
            }
          }
        }
        EORM
    end

    def self.hostrisk_reduce
      <<-EORR.gsub(/^ {8}/, "")
        function(keys, values) {
          var hosts = {};
          values.forEach(function(value) {
            value.forEach(function(host) {
              if (! hosts[host]) {
                hosts[host] = 1;
              }
              else {
                hosts[host]++;
              }
            });
          });
          return hosts;
        }
        EORR
    end
  end
end