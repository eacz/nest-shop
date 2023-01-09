import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  if (!user) {
    throw new InternalServerErrorException('User not found');
  }
  let dataToReturn = user;
  if (data) {
    switch (typeof data) {
      case 'string':
        const propertyRequired = user[data];
        if (propertyRequired) {
          dataToReturn = propertyRequired;
        } else {
          throw new InternalServerErrorException(
            `Property ${data} doesn't exists on user entity`,
          );
        }
        break;
      case 'object':
        if (data instanceof Array<string>) {
          const userProps = {};
          data.forEach((prop) => {
            if (user[prop]) {
              userProps[prop] = user[prop];
            } else {
              throw new InternalServerErrorException(
                `Property ${prop} doesn't exists on user entity`,
              );
            }
          });
          dataToReturn = userProps;
          break;
        }
    }
  }
  return dataToReturn;
});
