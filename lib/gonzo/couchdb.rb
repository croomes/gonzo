require 'couchrest'
require 'mcollective'

# TODO: move mcollective require/include out
include MCollective::RPC

module Gonzo
  module Couchdb

    def self.included(base)
      base.extend ClassMethods
    end

    module ClassMethods

      def connect(options={})

        # Load defaults from couchrest config
        default_options

        protocol = options['protocol'] || @default_options['protocol']
        host     = options['host']     || @default_options['host']
        port     = options['port']     || @default_options['port']
        username = options['username'] || @default_options['username']
        password = options['password'] || @default_options['password']
        db       = options['db']       || @default_options['db']

        if username && password
          basic_auth = "#{username}:#{password}@"
        end

        # TODO: better database name parsing
        # https://wiki.apache.org/couchdb/HTTP_database_API
        # A database must be named with all lowercase letters (a-z), digits (0-9), or any of 
        # the _$()+-/ characters and must end with a slash in the URL. The name has to start 
        # with a lowercase letter (a-z).
        db.downcase!

        Resque.logger.debug("Connecting to #{protocol}://#{basic_auth}#{host}:#{port}/#{db}")
        CouchRest.database!("#{protocol}://#{basic_auth}#{host}:#{port}/#{db}")
      end

      def get_last_rev(id)
        begin
          @db.get(id)["_rev"]
        rescue => e
          nil
        end
      end

      def get_last_risk(id)
        begin
          @db.get(id)["risk"]
        rescue => e
          nil
        end
      end

      def save(id, doc)
        before = Time.now.to_f

        doc.merge!('_id' => id)
        lastrev = get_last_rev(id)
        if lastrev
          doc.merge!('_rev' => lastrev)
        end

        # TODO: Refactor to avoid duplicate get
        risk = get_last_risk(id)
        if risk
          doc.merge!('risk' => risk)
        end

        begin
          @db.save_doc(doc)
        rescue => e
          Resque.logger.error("%s: %s: %s" % [e.backtrace.first, e.class, e.to_s])
        ensure
          after = Time.now.to_f
          Resque.logger.debug("Updated data for #{id} in #{after - before}s")
        end
      end

      def default_options #:nodoc:
        # Load configuration from Couchrest config
        @default_options = YAML.load_file("config/couchdb.yml")[ENV["RAILS_ENV"] || "development"]
      end

    end
  end
end