require 'couchrest'
require 'mcollective'

include MCollective::RPC

module MCollective
  module Couchdb
    def self.included(base)
      base.extend ClassMethods
    end

    module ClassMethods

      # def dbname(name)
      #   default_options[:dbname] = name
      # end
      # 
      # def basic_auth(u, p)
      #   default_options[:basic_auth] = {:username => u, :password => p}
      # end

      def connect(host, port, dbname, options={})
        CouchRest.database!("http://admin:admin@#{host}:#{port}/#{dbname}")
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
        @default_options
      end

    end
  end
end