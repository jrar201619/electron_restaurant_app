# sinatra_backend.rb
require 'sinatra'
require 'json'
# Aquí irían tus requires a los modelos y la base de datos
# require_relative 'models/category'
# require_relative 'config/database'

set :port, 4567 # Puerto donde escuchará tu API
set :bind, '0.0.0.0' # Permite conexiones desde cualquier IP (para localhost)

# Habilitar CORS para que Electron pueda hacer peticiones
before do
  headers 'Access-Control-Allow-Origin' => '*',
          'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
          'Access-Control-Allow-Headers' => 'Content-Type'
end

options '/*' do
  200
end

# Ejemplo de ruta para obtener categorías
get '/categories' do
  content_type :json
  # Aquí llamarías a tu lógica Ruby para obtener categorías de la DB
  # categories = Category.all.map(&:to_hash) # Suponiendo que Category tiene un método to_hash
  # categories.to_json
  [
    { id: 1, name: 'Bebidas' },
    { id: 2, name: 'Comida Principal' },
    { id: 3, name: 'Postres' }
  ].to_json
end

# Ejemplo de ruta para agregar una categoría
post '/categories' do
  content_type :json
  request.body.rewind
  data = JSON.parse(request.body.read)
  # Aquí llamarías a tu lógica Ruby para guardar la nueva categoría
  # new_category = Category.create(name: data['name'])
  # new_category.to_hash.to_json
  { id: rand(100..999), name: data['name'] }.to_json # Simulación
end

# Puedes añadir más rutas para productos, ventas, etc.