module MCollective
  class Discovery
    class Redis
      require 'redis'

      class << self
        def discover(filter, timeout, limit=0, client=nil)
          config = Config.instance

          host = config.pluginconf.fetch("redis.host", "localhost")
          port = Integer(config.pluginconf.fetch("redis.port", "6379"))
          db = Integer(config.pluginconf.fetch("redis.db", "1"))
          max_age = Integer(config.pluginconf.fetch("redis.max_age", 1800))

          redis_opts = {:host => host, :port => port, :db => db}

          @redis = ::Redis.new(redis_opts)

          found = [collective_hostlist(client.options[:collective], max_age)]

          filter.keys.each do |key|
            case key
              when "fact"
                fact_search(filter["fact"], found, max_age, client.options[:collective])

              when "cf_class"
                find_in_zlist("class", found, max_age, filter[key])

              when "agent"
                find_in_zlist("agent", found, max_age, filter[key])

              when "identity"
                identity_search(filter["identity"], found, max_age, client.options[:collective])
            end
          end

          # filters are combined so we get the intersection of values across
          # all matches found using fact, agent and identity filters
          found.inject(found[0]){|x, y| x & y}
        end

        def fact_search(filter, found, max_age, collective)
          return if filter.empty?

          hosts = collective_hostlist(collective, max_age)
          facts = {}

          hosts.each do |host|
            facts[host] = @redis.hgetall("mcollective::facts::#{host}")
          end

          filter.each do |f|
            matched_hosts = []

            fact = f[:fact]
            value = f[:value]

            hosts.each do |host|
              matched_hosts << host if facts[host].include?(fact) && facts[host][fact].match(regexy_string(value))
            end

            found << matched_hosts
          end
        end

        def identity_search(filter, found, max_age, collective)
          return if filter.empty?

          hosts = collective_hostlist(collective, max_age)

          filter.each do |match|
            found << hosts.grep(regexy_string(match))
          end
        end

        def find_in_zlist(key_type, found, max_age, filter)
          return if filter.empty?

          prefix = "mcollective::%s" % key_type
          oldest = Time.now.utc.to_i - max_age

          members = @redis.keys.grep(/^#{prefix}/).map do |key|
            key.match(/^#{prefix}::(.+)$/)[1]
          end

          filter.each do |matcher|
            discovered = []

            matched = members.grep(regexy_string(matcher))

            matched.each do |member|
              discovered.concat @redis.zrange("#{prefix}::#{member}", 0, oldest)
            end

            found << discovered
          end
        end

        def collective_hostlist(collective, max_age)
          now = Time.now.utc.to_i
          oldest = now - max_age

          @redis.zrangebyscore("mcollective::collective::#{collective}", oldest, now)
        end

        def regexy_string(string)
          if string.match("^/")
            Regexp.new(string.gsub("\/", ""))
          else
            string
          end
        end
      end
    end
  end
end
