module Mcollective
  class Ping
    @queue = :mcollective_jobs
    def self.perform(release_id)
      release = Release.find(release_id)
    

      # uri = URI.parse('http://pygments.appspot.com/')
      # request = Net::HTTP.post_form(uri, {'lang' => snippet.language, 'code' => snippet.plain_code})
      # snippet.update_attribute(:highlighted_code, request.body)
    end
  end
end