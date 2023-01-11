<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Clone Project
2. Install dependencies

```
yarn install
```

3. Clone file ´´´.env.template´´´ and rename it as .env
4. Redefine the enviroment variables in .env
5. Run database

```
docker compose up -d
```

6. Run project in dev

```
yarn start:dev
```

7. Execute SEED to have example data to test (you will have to create an user manually because the route its protected to admin roles, or comment the @Auth() line)

```
{{url}}/api/seed
```
