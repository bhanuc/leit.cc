import {
  RESOURCE_CREATED,
  RESOURCE_DELETED,
  RESOURCE_SUCCESS,
  RESOURCE_UPDATED,
  respond,
} from "@staart/messages";
import {
  ClassMiddleware,
  Controller,
  Delete,
  Get,
  Middleware,
  Patch,
  Post,
  Put,
  Request,
  Response,
} from "@staart/server";
import { Joi, joiValidate } from "@staart/validate";
import { authHandler, validator } from "../../helpers/middleware";
import {
  localsToTokenOrKey,
  organizationUsernameToId,
} from "../../helpers/utils";
import {
  createDomainForUser,
  deleteDomainForUser,
  getOrganizationDomainForUser,
  getOrganizationDomainsForUser,
  updateDomainForUser,
  verifyDomainForUser,
} from "../../rest/organization";

@Controller(":id/domains")
@ClassMiddleware(authHandler)
export class OrganizationDomainsController {
  @Get()
  async getUserDomains(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const domainParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        itemsPerPage: Joi.number(),
      },
      domainParams
    );
    return getOrganizationDomainsForUser(
      localsToTokenOrKey(res),
      id,
      domainParams
    );
  }

  @Put()
  @Middleware(
    validator(
      {
        domain: Joi.string(),
      },
      "body"
    )
  )
  async putUserDomains(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    await createDomainForUser(
      localsToTokenOrKey(res),
      id,
      req.body,
      res.locals
    );
    return respond(RESOURCE_CREATED);
  }

  @Get(":domainId")
  async getUserDomain(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const domainId = req.params.domainId;
    joiValidate(
      {
        id: Joi.string().required(),
        domainId: Joi.string().required(),
      },
      { id, domainId }
    );
    return getOrganizationDomainForUser(localsToTokenOrKey(res), id, domainId);
  }

  @Patch(":domainId")
  @Middleware(
    validator(
      {
        domain: Joi.string(),
      },
      "body"
    )
  )
  async patchUserDomain(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const domainId = req.params.domainId;
    joiValidate(
      {
        id: Joi.string().required(),
        domainId: Joi.string().required(),
      },
      { id, domainId }
    );
    await updateDomainForUser(
      localsToTokenOrKey(res),
      id,
      domainId,
      req.body,
      res.locals
    );
    return respond(RESOURCE_UPDATED);
  }

  @Delete(":domainId")
  async deleteUserDomain(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const domainId = req.params.domainId;
    joiValidate(
      {
        id: Joi.string().required(),
        domainId: Joi.string().required(),
      },
      { id, domainId }
    );
    await deleteDomainForUser(
      localsToTokenOrKey(res),
      id,
      domainId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }

  @Post(":domainId/verify")
  async verifyOrganizationDomain(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const domainId = req.params.domainId;
    const method = req.body.method || req.query.method;
    joiValidate(
      {
        id: Joi.string().required(),
        domainId: Joi.string().required(),
        method: Joi.string().allow(["file", "dns"]).only(),
      },
      { id, domainId, method }
    );
    await verifyDomainForUser(
      localsToTokenOrKey(res),
      id,
      domainId,
      method,
      res.locals
    );
    return respond(RESOURCE_SUCCESS);
  }
}
