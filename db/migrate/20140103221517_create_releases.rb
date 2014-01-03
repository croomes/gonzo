class CreateReleases < ActiveRecord::Migration
  def change
    create_table :releases do |t|
      t.string :version
      t.integer :product_id
      t.string :status
      t.string :slug
      t.timestamps
    end
    add_index :releases, :slug, unique: true
  end
end
