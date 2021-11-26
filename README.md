# Instruções para inicialiar os serviços desse repositório

## Docker
    docker-compose up --build --force-recreate --no-deps

## Back-end

ir para a pasta do back-end

    cd backend

inicializar o banco de dados

    php artisan migrate:refresh --seed

voltar para a pasta raiz

    cd ..

## Front-end

ir para a pasta front-end

    cd frontend

instalar as dependências

    npm install

iniciar a aplicação

    npm start

## Pronto
