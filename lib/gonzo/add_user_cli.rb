#!/usr/bin/env rails runner

require 'optparse'

class AddUserCli

def run
  o = OptionParser.new do |o|
    o.on('-u USERNAME') { |b| $user = b }
    o.on('-p PASSWORD') { |b| $password = b }
    o.on('-m EMAIL') { |b| $email = b }
    o.on('-h') { puts o; exit }
    o.parse!
  end

  if $user.nil? or $password.nil? or $email.nil?
    puts o; exit 1;
  end

  puts 'ROLES'
  ['admin', 'user', 'VIP'].each do |role|
    Role.where({ :name => role }, :without_protection => true)
    puts 'role: ' << role
  end
  puts 'DEFAULT USERS'
  user = User.find_or_create_by_email :name => $user, :email => $email, :password => $password, :password_confirmation => $password
  puts 'user: ' << user.name
  user.add_role :admin
end

end
