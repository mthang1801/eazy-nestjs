# NestJS Resource configure

## Table of Contents

### Installation

- Install docker (prequisition)
- Open command line or terminal, so on. Then type commands:

* $ git clone https://github.com/mthang1801/nestjs-resource-configure.git
* $ npm install -f
* $ docker-compose up
* $ Crate file .env and fill value the same as .env.example
* $ npm run start:dev

### Deprecated Features

- Some sql queries has been deprecated as ~~count~~, ~~find~~

### New Features

**1. Sql new Features queries :**

- findMany, findOne, findById, findOneAndCreate.

Example :

```
await this.userRepo.findOne({user_id : 1})
or
await this.userRepo.findOne({where :{user_id : 1}})
```

- createOne, createMany.
- update.
- delete.
- rawQuery.
- aggregation.
- Sql rollback transaction.

**2. Upload files**

- Upload files with multer

**3. Error Logs**

- Writing Error Log In Database

**4. RabbitMQ**

- RPC
- Routing

**5. Schedule**

- Static Cron
- Dynamic Cron

**6. Redis**

**7. Elasticsearch**

- search Term
- search Match
- search MatchPhrase
- search Nested

**8. Websockets**

**9. Swagger**

**10. Versioning**

- URI Versioning
- Header Versioning

This project was developed by [MVT](https://github.com/mthang1801). Contributions of any kind welcome!

Especially, if you are exicited about Machine learning, Deep learning, Data science, etc... Visit my blog : [https://mvt-blog.com/](https://mvt-blog.com/)
