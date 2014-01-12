module MCollective
  module Agent
    class Registration<RPC::Agent
      require 'redis'

      attr_reader :timeout, :meta

      def initialize
        @timeout = 1

        @config = Config.instance

        @meta = {:license => "GPLv2",
          :author => "R.I.Pienaar <rip@devco.net>",
          :url => "https://github.com/puppetlabs/mcollective-plugins"}

        host = config.pluginconf.fetch("redis.host", "localhost")
        port = Integer(config.pluginconf.fetch("redis.port", "6379"))
        db = Integer(config.pluginconf.fetch("redis.db", "0"))

        @redis = Redis.new(:host => host, :port => port, :db => db)
      end

      def handlemsg(msg, connection)
        data = msg[:body]

        begin
          time = Time.now.utc.to_i

          @redis.multi do
            data[:collectives].each {|c| @redis.zadd "mcollective::collective::#{c}", time, data[:identity]}
            data[:agentlist].each {|a| @redis.zadd "mcollective::agent::#{a}", time, data[:identity]}
            data[:classes].each {|c| @redis.zadd "mcollective::class::#{c}", time, data[:identity]}
            @redis.set "mcollective::nodecheckin::#{data[:identity]}", time
            @redis.del "mcollective::nodeagents::#{data[:identity]}"
            @redis.sadd "mcollective::nodeagents::#{data[:identity]}", data[:agentlist]
            @redis.del "mcollective::facts::#{data[:identity]}"
            @redis.hmset "mcollective::facts::#{data[:identity]}", data[:facts].map{|k, v| [k.to_s, v.to_s]}.flatten
          end
        rescue => e
          Log.error("%s: %s: %s" % [e.backtrace.first, e.class, e.to_s])
        end

        nil
      end

      def help
        <<-EOH
Redis Registration Agent
=============

EOH
      end
    end
  end
end

# vi:tabstop=2:expandtab:ai:filetype=ruby
