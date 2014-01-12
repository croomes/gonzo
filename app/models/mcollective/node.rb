class Mcollective::Node
  require 'gonzo/discover'
  
  #extend Mcomaster::McClient
  include Comparable

  # attr_accessor :id, :agents, :facts, :checkin, :checkin_age  
  
  def self.collectives
    collectives = $redis.keys("mcollective::collective::*")
    for ckey in collectives
      yield ckey.gsub(/^mcollective\:\:collective\:\:/, ""), ckey
    end    
  end
  
  def self.all
    now = Time.now.utc.to_i
    oldest = now - APP_CONFIG['discovery_ttl']

    a = Array.new
    
    options =  MCollective::Util.default_options
    mc = rpcclient("rpcutil")
    starttime = Time.now
    nodes = mc.discover
    discoverytime = Time.now - starttime
    nodes.each { |c| 
      puts c
      a.push(Node.new(:id => c))
    }
    return a.sort
    
    # collectives() { |cname,ckey|
    #   results = $redis.zrangebyscore(ckey, oldest, now)
    #   for node in results
    #     a.push(Node.new(:id => node, :collective => cname))
    #   end
    # }
    # 
    # return a.sort
  end

  def <=>(other)
    @id <=> other.id
  end

  def self.find(id)
    agents = $redis.smembers("mcollective::nodeagents::#{id}")
    
    if !agents.nil?
      return Node.new(:id => id, :agents => agents, :verbose => true)
    end
    return nil
  end
  
  def self.count()
    now = Time.now.utc.to_i
    oldest = now - APP_CONFIG['discovery_ttl']
    count = 0
    
    collectives() { |cname,ckey|
      count += $redis.zcount(ckey, oldest, now)
    }    
    
    return 
  end

  def initialize(args={})
    @id = args[:id]
    if args[:verbose]
      @agents = args[:agents]
      @facts = $redis.hgetall("mcollective::facts::#{id}")
      @checkin = $redis.get("mcollective::nodecheckin::#{id}")
      if !@checkin.nil?
        now = Time.now.utc.to_i
        @checkin_age = now - Integer(@checkin)
      end
    end
  end  
  
end
