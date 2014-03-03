require 'gonzo/couchdb'

class AddReleases
  @queue = :mcollective_jobs
  Resque.logger.level = Logger::DEBUG
  def self.perform()
    include Gonzo::Couchdb

    Resque.logger.info("Starting AddReleases")

    @nodedb    = connect({"db" => "mcollective"})
    @releasedb = connect({"db" => "releases"})
    @views = ["releaselist"]

    # Create helper views
    @views.each do |view|
      create_view(view)
    end

    # Get releases from node facts
    @nodedb.get("_design/releaselist").view(:all) do |result|
      if result['key']
        begin
          @releasedb.get(result['key'])
          Resque.logger.debug("Release #{result['key']} already exists")
        rescue
          begin
            release = {
              "_id"       => result['key'],
              :slug       => result['key'],
              :status     => "Available",
              :type       => "Release",
              :updated_at => Time.now,
              :created_at => Time.now,
            }
            @releasedb.save_doc(release)
            Resque.logger.info("Created release #{result['key']}")
          rescue
            Resque.logger.error("ERROR creating release #{result['key']}")
          end
        end
      end
    end
  end

  def self.create_view(view)
    begin
      @nodedb.save_doc({
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

  def releaselist_map
    <<-EOS.gsub(/^ {10}/, "")
      function(doc) {
        if (doc.key && doc.facts && doc.facts['gonzo_available_releases']) {
          JSON.parse(doc.facts['gonzo_available_releases']).forEach(function(release) {
            emit(release, doc._id);
          });
        }
      }
      EOS
  end

  def releaselist_reduce
    <<-EOS.gsub(/^ {10}/, "")
      function(keys, values) {
        return sum(values);
      }
      EOS
  end
end