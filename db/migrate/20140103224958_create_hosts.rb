class CreateHosts < ActiveRecord::Migration
  def change
    create_table :hosts do |t|
      t.string :name
      t.string :status
      t.string :slug
      t.timestamps
    end
    add_index :hosts, :slug, unique: true
  end
end
