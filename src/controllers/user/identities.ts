import { RESOURCE_DELETED, RESOURCE_SUCCESS, respond } from "@staart/messages";
import {
  ClassMiddleware,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
  Response,
} from "@staart/server";
import { Joi, joiValidate } from "@staart/validate";
import { authHandler } from "../../helpers/middleware";
import { userUsernameToId } from "../../helpers/utils";
import {
  connectUserIdentityForUser,
  createUserIdentityForUser,
  deleteIdentityForUser,
  getUserIdentitiesForUser,
  getUserIdentityForUser,
} from "../../rest/user";

@Controller(":id/identities")
@ClassMiddleware(authHandler)
export class UserIdentitiesController {
  @Get()
  async getUserIdentities(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const identityParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        itemsPerPage: Joi.number(),
      },
      identityParams
    );
    return getUserIdentitiesForUser(res.locals.token.id, id, identityParams);
  }

  @Put()
  async createUserIdentity(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    joiValidate({ id: Joi.string().required() }, { id });
    return createUserIdentityForUser(res.locals.token.id, id, req.body);
  }

  @Post(":service")
  async connectUserIdentity(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const service = req.params.service;
    const url = req.body.url;
    joiValidate(
      { service: Joi.string().required(), url: Joi.string().required() },
      { service, url }
    );
    await connectUserIdentityForUser(res.locals.token.id, id, service, url);
    return respond(RESOURCE_SUCCESS);
  }

  @Get(":identityId")
  async getUserIdentity(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    const identityId = req.params.identityId;
    joiValidate(
      {
        id: Joi.string().required(),
        identityId: Joi.string().required(),
      },
      { id, identityId }
    );
    return getUserIdentityForUser(res.locals.token.id, id, identityId);
  }

  @Delete(":identityId")
  async deleteUserIdentity(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    const identityId = req.params.identityId;
    joiValidate(
      {
        id: Joi.string().required(),
        identityId: Joi.string().required(),
      },
      { id, identityId }
    );
    await deleteIdentityForUser(
      res.locals.token.id,
      id,
      identityId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }
}
