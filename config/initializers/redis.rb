for c in ['redis_host', 'redis_port', 'redis_db']
  if APP_CONFIG[c].nil?
    raise "Couldn't find config setting for #{c}. Check application.yml."
  end
end

begin
  redis_db_number = Integer(APP_CONFIG['redis_db'])
rescue => e
  raise "The redis_db setting must a NUMBER: #{e.message}"
end 

$redis = Redis.new(:host => APP_CONFIG['redis_host'], :port => APP_CONFIG['redis_port'], :db => redis_db_number)
pass = APP_CONFIG['redis_pass']
if !pass.nil?
  $redis.pass(pass)
end