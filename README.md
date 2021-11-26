# Instruções para inicializar os serviços desse repositório

## Docker
``` docker-compose up --build --force-recreate --no-deps ```

## Back-end
1. ir para a pasta do back-end: `cd backend`
2. inicializar o banco de dados: `php artisan migrate:refresh --seed`
3. voltar para a pasta raiz: `cd ..`

## Front-end
1. ir para a pasta front-end: `cd frontend`
2. instalar as dependências: `npm install`
3. iniciar a aplicação: `npm start`
## Pronto
A aplicação poderá ser acessada em `http://localhost:3000/`
